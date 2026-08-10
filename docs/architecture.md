# Architecture & Engineering Decisions

This document explains *why* OpsPilot is built the way it is, not just what each piece does. Every
decision below was made deliberately and validated against the running system, not assumed.

## Why Docker?

A container is the unit that guarantees "works on my machine" actually means "works everywhere":
the same JRE version, the same base OS libraries, the same filesystem layout, whether it runs
locally, in CI, or eventually on EKS. Without it, "Java 21" on a developer's laptop and "Java 21"
on a CI runner or a cloud VM can still differ in ways that cause subtle bugs.

## Why multi-stage builds?

The `Dockerfile` has two stages: a `build` stage with the full JDK and Maven toolchain, and a
`runtime` stage that only copies the final `app.jar` out of it. The build stage (526MB, including
Maven's dependency cache) never ships — only the runtime stage does (188MB, JRE + jar only). This
matters for three reasons: smaller images pull faster (meaningful at deploy time, especially
during a rolling update), a smaller image has a smaller attack surface (no build tools, no source
code, no Maven cache sitting in a shipped artifact), and it keeps the Dockerfile itself as the
single source of truth for how the jar is built — no separate "build locally, copy the jar in"
step that could drift from what CI actually does.

## Why non-root containers?

The runtime stage creates a dedicated `opspilot` user and switches to it (`USER opspilot`) before
running the jar. If the application or one of its dependencies had a remote-code-execution
vulnerability, running as root would hand an attacker root inside the container immediately. Many
Kubernetes clusters also enforce non-root execution via Pod Security Standards — building this in
from the start avoids a retrofit later.

## Why Kubernetes (for this project)?

Docker Compose is enough to *run* OpsPilot locally, but it can't demonstrate the operational
concerns that matter once something has to survive real production conditions: what happens when
a pod dies mid-request, how traffic gets pulled away from an unhealthy instance automatically,
how configuration and secrets get distributed without baking them into an image, and how storage
survives a container being recreated. Kubernetes is the vehicle for demonstrating all of that
concretely — and it's also the same abstraction EKS uses, so everything in `k8s/` is a rehearsal
for the actual AWS migration path, not throwaway learning scaffolding.

## Why readiness and liveness probes (and why they're different)

`k8s/04-app.yaml` points readiness and liveness at two *different* Actuator health groups on
purpose:

- **Readiness** (`/actuator/health/readiness`) includes the database check
  (`management.endpoint.health.group.readiness.include=readinessState,db`). If Postgres becomes
  unreachable, this flips to `DOWN`, Kubernetes marks the pod `NotReady`, and the Service stops
  routing traffic to it — without touching the container itself.
- **Liveness** (`/actuator/health/liveness`) deliberately excludes the database. Liveness failures
  cause a container **restart**. Restarting the app process does nothing to fix a downstream
  Postgres outage — it would just add restart churn on top of an existing incident, and could
  even cause a restart storm across every pod simultaneously losing DB connectivity at once.

This was validated, not assumed: scaling the Postgres Deployment to zero flips readiness to `DOWN`
within one probe interval (pod removed from the Service's endpoints, zero container restarts,
confirmed via `kubectl describe pod` showing repeated `Unhealthy` readiness events but
`RESTARTS: 0`), while liveness stays `UP` the entire time. Restoring Postgres flips readiness back
automatically with no manual intervention.

## Why a ConfigMap?

Non-sensitive, environment-specific values (`SPRING_PROFILES_ACTIVE`, `DB_URL`,
`CORS_ALLOWED_ORIGINS`, `POSTGRES_DB`) live in `k8s/01-configmap.yaml` rather than being baked into
the Docker image or hardcoded in Java source. This means the *same* image can run in different
environments (or with different CORS origins for different frontend deployments) purely by
changing the ConfigMap — no rebuild required. It also makes configuration reviewable in version
control as plain, readable YAML.

## Why a Secret (and why it's created imperatively, not `kubectl apply`-ed)?

`DB_USERNAME`/`DB_PASSWORD` are the one thing that must never appear in a file this repository
tracks. `k8s/02-secret.example.yaml` documents the exact shape and the `kubectl create secret
generic ... --from-literal=...` command that creates the real one — deliberately not a file you
`kubectl apply`, so no real credential value is ever written to disk in this repo, only typed
directly into a command. Kubernetes Secrets are base64-encoded, not encrypted, in `etcd` by
default — see [Secrets are configuration, not encryption](#secrets-are-configuration-not-encryption)
below.

## Why a PersistentVolumeClaim (and why PostgreSQL persistence matters)

By default, a pod's writable filesystem (and an `emptyDir` volume) is tied to that specific pod
instance — Kubernetes routinely replaces pods (rolling updates, node drains, crashes, manual
deletion), and none of that is "data loss" from Kubernetes' point of view, because it never
promised the container filesystem was durable.

This was proven, not theorized, during this project's development: with Postgres's data directory
on an `emptyDir` volume, deleting the Postgres pod caused Flyway to find a completely empty
database on the replacement pod — the schema and all data were gone, and `/api/incidents` started
returning `500 relation "incidents" does not exist`. Switching to a `PersistentVolumeClaim`
(`k8s/03-db.yaml`) and repeating the exact same test — delete the pod, wait for a replacement —
showed the opposite: the new pod reattached the *same* underlying volume, and a test incident
created before the deletion was still there afterward, verified via a live API call. A PVC is a
request for storage that Kubernetes binds to a PersistentVolume that outlives any single pod;
that indirection is what makes the data survive.

### Secrets are configuration, not encryption

Kubernetes Secrets and ConfigMaps are structurally almost identical — the difference is intent,
not protection. A Secret's value is base64-encoded (trivially reversible) in `etcd`, readable by
anyone with RBAC access to `get`/`list` secrets in the namespace, or by anyone who can `exec` into
a pod that mounts one. That's an acceptable simplification for a local, single-user learning
cluster; it would not be acceptable as-is in real production. Real hardening — not implemented
here, since it requires infrastructure this project deliberately doesn't stand up — would add
encryption at rest for `etcd`, tighter RBAC, and ideally sourcing the credential live from a
platform secret store (AWS Secrets Manager, External Secrets Operator) rather than storing it in
`etcd` at all. See [`aws-migration.md`](aws-migration.md).

## Why Actuator?

Spring Boot Actuator is the difference between "the process is running" and "the application can
actually do its job." `/actuator/health` aggregates real dependency checks (database connectivity,
disk space) into a single status Kubernetes' probes can act on; `/actuator/metrics` exposes JVM,
HTTP, and connection-pool internals without writing a single line of custom instrumentation code.
Every metric shown on the frontend's Observability page comes from here — nothing is mocked.

## Why HikariCP (and what pool exhaustion actually means)

HikariCP is Spring Boot's default connection pool — a set of pre-opened, reusable database
connections the app borrows from and returns to, instead of paying the cost of a fresh TCP
handshake + Postgres authentication + backend-process fork on every single request. Without
pooling, any real concurrency would either be crushingly slow (connection setup costs orders of
magnitude more than a typical query) or exhaust Postgres's own connection ceiling outright.

**Pool exhaustion** is what happens when every connection in the pool is checked out and busy at
once: new requests queue (visible live via the `hikaricp.connections.pending` metric) waiting for
one to free up, and if none does within `connection-timeout`, the request fails with a
`SQLTransientConnectionException` instead of hanging forever. This was deliberately reproduced
during development: shrinking the pool to 2 connections and firing thousands of concurrent
requests produced the exact textbook signature —
`HikariPool-1 - Connection is not available, request timed out after 260ms (total=2, active=2,
idle=0, waiting=196)` — with `hikaricp.connections.timeout`'s counter incrementing to match the
exact count of failed requests. In production, this shows up as a burst of `500`s correlated with
a traffic spike or a slow downstream query, elevated p99 latency *before* outright failures
appear, and — distinctively — the app staying otherwise healthy (liveness fine) while only a
subset of requests fail, which often gets mis-diagnosed as "flaky" rather than pool sizing. The
leading indicator to watch is `hikaricp.connections.active` pinned at `max` with
`hikaricp.connections.pending > 0` sustained over time.

## How CI works

`.github/workflows/ci.yml` runs two independent jobs on every push and pull request: a backend job
(JDK 21, `./mvnw -B test`) and a frontend job (Node 22, `npm ci && npm run lint && npm run build`).
The backend's `@SpringBootTest` uses Testcontainers to boot a real, ephemeral PostgreSQL container
per run — Flyway migrations and Hibernate schema validation execute for real against it, so CI is
validating actual database integration, not a mocked substitute. No cloud credentials or secrets
are involved; Testcontainers manages its own container lifecycle using the GitHub Actions runner's
already-available Docker daemon.

## How this could move to ECR / EKS / RDS

See [`aws-migration.md`](aws-migration.md) for the detailed path. In short: the Docker images
already built here go to ECR unchanged; the `k8s/` manifests apply to EKS with only the `image:`
field and a StorageClass change; and RDS replaces the in-cluster Postgres Deployment entirely,
which the app already supports without code changes since `DB_URL` is just an environment
variable.
