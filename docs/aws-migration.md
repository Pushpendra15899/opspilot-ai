# AWS Migration Path

**Status: not implemented.** No AWS resources have been created for this project, no AWS
credentials are used anywhere in this repository, and OpsPilot is not deployed to AWS. This
document describes the intended path — it is a design document, not a claim of what exists today.

The application was built to make this migration require infrastructure and configuration
changes only, not application code changes: every environment-specific value already flows in
through environment variables (see `application-prod.properties` and `k8s/01-configmap.yaml`),
which is exactly the shape AWS's managed services expect to inject values into.

## ECR (container registry)

The Docker images already built by this repo's `Dockerfile` and `frontend/Dockerfile` are
standard OCI images — no changes needed to make them ECR-compatible. What does need attention at
push time:

- **Architecture**: images built locally on Apple Silicon are `linux/arm64`. Standard EKS worker
  nodes default to `amd64` unless deliberately provisioned as Graviton node groups. Building for
  the target architecture (`docker buildx build --platform linux/amd64`, or a multi-arch manifest)
  is a build-time flag, not a Dockerfile change.
- **Naming**: `<account-id>.dkr.ecr.<region>.amazonaws.com/opspilot-backend:<tag>`. Use an
  immutable, traceable tag (a git commit SHA), not `:latest` — the stale-image bug documented in
  [`troubleshooting.md`](troubleshooting.md) is exactly the failure mode ECR's **tag immutability**
  repository setting exists to prevent.

## EKS (managed Kubernetes)

The manifests in `k8s/` are the rehearsal for this, not throwaway learning scaffolding. The only
changes needed:
- `image:` in `k8s/04-app.yaml` → the full ECR URI
- The PVC's `storageClassName` → an EBS-backed StorageClass (see RDS section for why you'd likely
  skip this for the database specifically)
- Pull authentication: normally none needed for same-account ECR — granted via the node's IAM role
  (`AmazonEC2ContainerRegistryReadOnly`) or, for pod-level scoping, **IRSA** (IAM Roles for Service
  Accounts)

Everything else — the Namespace, Service, ConfigMap, Secret pattern, readiness/liveness probes —
applies unchanged.

## RDS PostgreSQL (why managed, not in-cluster, for production)

This project deliberately runs Postgres *inside* Kubernetes, because that's what makes the PVC and
persistence story demonstrable and testable locally. For a real production deployment, **RDS is
the better default**, for reasons that are operational, not just convenient:

- **Backups and point-in-time recovery** are built in; a self-managed in-cluster Postgres needs
  its own backup strategy (`pg_dump` cron jobs, WAL archiving) built and tested separately.
- **Failover**: RDS Multi-AZ handles primary failure automatically; a single-replica in-cluster
  Postgres Deployment (as configured here) is a single point of failure — losing that pod's node
  means downtime until Kubernetes reschedules it.
- **Patching**: RDS handles minor version upgrades and OS-level patching; self-hosted means owning
  that lifecycle.
- **Storage**: even on EKS with an EBS-backed PVC, a single EBS volume is still single-AZ with no
  built-in replication — you'd be re-implementing a subset of what RDS already provides.
- **Read replicas**: trivial to add in RDS; non-trivial to build correctly on self-hosted Postgres.

The migration itself is a configuration change, not a rewrite: `DB_URL` currently points at the
in-cluster `opspilot-db` Service; pointing it at an RDS endpoint instead is the entire change,
because the app only ever knows about a JDBC URL from an environment variable.

## ALB (Application Load Balancer)

Replaces the local `LoadBalancer`-type Service / `kubectl port-forward` workflow used here with a
real internet-facing (or internal) load balancer, provisioned via the AWS Load Balancer Controller
reading a Kubernetes `Ingress` resource pointed at the existing `opspilot-app` Service.

## VPC / IAM

Network isolation (private subnets for the database and app pods, public subnets only for the
ALB) and least-privilege IAM — node IAM roles scoped to exactly what's needed (ECR pull, and
nothing else by default), plus IRSA for any pod that needs to call other AWS services directly
(e.g., reading from Secrets Manager).

## AWS Secrets Manager

Replaces the imperatively-created Kubernetes `Secret` (`kubectl create secret ...`) with a
secret pulled live from AWS Secrets Manager — via the **Secrets Store CSI driver** (mounted as a
volume, then synced to a Kubernetes Secret) or **External Secrets Operator**. The Deployments in
`k8s/04-app.yaml` already only reference the Secret by name and key
(`secretKeyRef: { name: opspilot-db-credentials, key: DB_PASSWORD }`) — they don't care how that
Secret object gets populated, so this swap requires zero changes to the Deployment manifests
themselves.

## CloudWatch (and optionally Prometheus/Grafana)

Spring Boot Actuator already exposes everything needed for this — `/actuator/metrics` (JVM,
HTTP, HikariCP) and structured JSON logs (`logging.structured.format.console=ecs`, already
configured). CloudWatch Container Insights / the CloudWatch agent can ship both without any
application changes. If CloudWatch's dashboarding/alerting isn't sufficient on its own, the same
`/actuator/prometheus` endpoint (already exposed) is ready for a Prometheus + Grafana stack
instead — deliberately not stood up in this project to keep scope bounded, not because it's
architecturally difficult from here.

## Summary: what changes, what doesn't

| | Stays the same | Changes |
|---|---|---|
| Application code | ✅ everything | — |
| Docker images | ✅ same Dockerfiles | rebuild for `linux/amd64`, push to ECR instead of local |
| K8s manifests | ✅ same structure/probes/ConfigMap pattern | `image:` URI, StorageClass, Secret source |
| Database | — | in-cluster Postgres → RDS |
| Ingress | — | `kubectl port-forward` → ALB + Ingress |
| Secrets | ✅ same `secretKeyRef` pattern in Deployments | Secret *populated by* Secrets Manager instead of `kubectl create` |
| Observability | ✅ same Actuator endpoints | shipped to CloudWatch (and optionally Prometheus) instead of read locally |
