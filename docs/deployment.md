# Deployment Guide

Three ways to run OpsPilot, from simplest to most production-like. All three use the exact same
Docker image and the exact same environment-variable-driven configuration — nothing is
duplicated or hardcoded per environment.

## 1. Local (no containers)

```bash
./mvnw spring-boot:run          # backend, dev profile, port 8080
cd frontend && npm run dev      # frontend, port 5173, proxies to :8080
```

Requires a local PostgreSQL instance (database `opspilot`). The `dev` profile has a working
default username; override `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` via environment variables if your
local setup differs.

## 2. Docker Compose

```bash
cp .env.example .env    # set a real POSTGRES_PASSWORD - .env is gitignored
docker compose up --build
```

Three services, in dependency order enforced by `depends_on: condition: service_healthy`:

1. `db` — Postgres 17, healthchecked via `pg_isready`
2. `app` — Spring Boot, `prod` profile, waits for `db` to be healthy; the image's own `HEALTHCHECK`
   (`/actuator/health`) gates the next step
3. `frontend` — Nginx serving the built React app, waits for `app` to be healthy

Access: frontend `http://localhost:3000`, backend `http://localhost:8080`.

## 3. Kubernetes (local cluster)

Tested against Docker Desktop's built-in Kubernetes. Manifests apply in numeric order:

```bash
kubectl apply -f k8s/00-namespace.yaml     # Namespace: isolates all OpsPilot resources
kubectl apply -f k8s/01-configmap.yaml     # ConfigMap: non-secret env vars

kubectl create secret generic opspilot-db-credentials -n opspilot \
  --from-literal=DB_USERNAME=opspilot \
  --from-literal=DB_PASSWORD="$(openssl rand -base64 18)"
  # ^ real Secret, created imperatively - never a file this repo tracks
  #   (see k8s/02-secret.example.yaml for the placeholder-only template)

kubectl apply -f k8s/03-db.yaml            # Postgres Deployment + Service + PVC
kubectl apply -f k8s/04-app.yaml           # App Deployment + Service, with readiness/liveness probes

kubectl port-forward -n opspilot svc/opspilot-app 8080:8080
```

Because Docker Desktop's Kubernetes shares the same image store as the Docker CLI, any image
built via `docker build -t opspilot-ai-app:latest .` is immediately usable by the cluster — no
registry push required for local development.

### Verifying the deployment

```bash
kubectl get pods -n opspilot           # both app and db should show 1/1 Running
kubectl get pvc -n opspilot            # opspilot-db-data should show Bound
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/incidents
```

### A note on `imagePullPolicy` and stale images

`k8s/04-app.yaml` uses `imagePullPolicy: IfNotPresent` with the `opspilot-ai-app:latest` tag. This
was the direct cause of a real bug hit during development: after rebuilding the image multiple
times, the cluster kept running an old build, because `IfNotPresent` only checks whether the *tag
string* exists locally, not whether its digest changed. The practical fix during iteration is to
build with a unique tag (`docker build -t opspilot-ai-app:$(date +%s) .`) and
`kubectl set image deployment/opspilot-app -n opspilot opspilot-app=opspilot-ai-app:<tag>`. In a
real registry-backed deployment (ECR), the equivalent discipline is immutable, unique tags (a git
SHA, not `:latest`) plus enabling **tag immutability** on the ECR repository itself — see
[`aws-migration.md`](aws-migration.md).

### Demonstrating self-healing (safe, reversible)

```bash
kubectl scale deployment opspilot-db -n opspilot --replicas=0   # simulate an outage
curl http://localhost:8080/actuator/health   # -> 503 DOWN within ~30s
kubectl scale deployment opspilot-db -n opspilot --replicas=1   # restore
curl http://localhost:8080/actuator/health   # -> 200 UP again, no app restart needed
```

Data survives this because Postgres's storage is a `PersistentVolumeClaim`, not `emptyDir` — see
[`architecture.md`](architecture.md#why-a-persistentvolumeclaim-and-why-postgresql-persistence-matters).
