# Troubleshooting

Real issues hit during this project's development, and how they were diagnosed and fixed — kept
here because they're genuinely instructive, not hypothetical.

## CORS 403 on POST but not GET

**Symptom**: `GET /api/incidents` works fine from the frontend, but creating an incident
(`POST /api/incidents`) fails with `403 Forbidden`, body `Invalid CORS request`.

**Root cause**: this is Spring MVC's own built-in CORS validation (`WebConfig.java`'s
`addCorsMappings`, backed by the `CORS_ALLOWED_ORIGINS` environment variable) — not Spring
Security, which this project doesn't use at all. Browsers omit the `Origin` header on same-origin
`GET` requests but include it on state-changing methods like `POST`. If the frontend's actual
origin (e.g. `http://localhost:5173` for the Vite dev server) isn't in the backend's configured
allow-list, `GET` silently works (no CORS check triggered) while `POST` gets rejected.

**Fix**: make sure `CORS_ALLOWED_ORIGINS` includes every origin you actually serve the frontend
from. `WebConfig.java` already supports a comma-separated list
(`CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`) — both the Docker
Compose/Nginx port and the local Vite dev port are allowed simultaneously.

**How it was diagnosed**: reproduced with `curl -H "Origin: http://localhost:5173" ...` against
both `GET` and `POST` — both failed identically once an explicit `Origin` header was added, proving
it was origin-based, not method-based, and ruling out Spring Security (confirmed absent from
`pom.xml` and the codebase) as a red herring.

## Kubernetes running a stale image after rebuilding

**Symptom**: `docker build` completes successfully, `kubectl rollout restart` reports success, but
the running pod still exhibits old behavior — new config properties don't take effect, new code
paths never execute.

**Root cause**: `imagePullPolicy: IfNotPresent` combined with a mutable tag (`:latest`). The
policy only checks whether the tag *string* already exists in the node's local image cache — not
whether the digest it points to actually changed. Docker Desktop's Kubernetes node can end up with
a cached image under `:latest` that's several rebuilds stale.

**Fix during iteration**: build with a unique tag and point the Deployment at it explicitly:
```bash
docker build -t opspilot-ai-app:$(date +%s) .
kubectl set image deployment/opspilot-app -n opspilot opspilot-app=opspilot-ai-app:<tag>
```
**Verification that actually catches this**: compare `docker inspect <tag> --format '{{.Id}}'`
against `kubectl get pod -o jsonpath='{.items[0].status.containerStatuses[0].imageID}'` — if they
don't match, the pod isn't running what you think it's running.

## HikariCP rejects a `connection-timeout` below 250ms

**Symptom**: the app fails to start entirely after lowering `spring.datasource.hikari.connection-timeout`
too far, with a clear diagnostic: `connectionTimeout cannot be less than 250ms`.

**Root cause**: HikariCP enforces this floor itself, on purpose — it's not a bug, it's the pool
refusing an unreasonable configuration rather than silently misbehaving.

**Fix**: don't go below 250ms. This was hit deliberately while reproducing pool-exhaustion
behavior for `docs/architecture.md`'s HikariCP section; production tuning should stay in the
seconds range, not milliseconds.

## `maximum-pool-size=1` crash-loops the app on startup

**Symptom**: with the connection pool sized to exactly 1, the app fails to start every time, with
Flyway timing out waiting for a connection that's already `active=1` — even though nothing else
should be using the database yet.

**Root cause**: the app's own startup sequence (Flyway migration + JPA/Hibernate schema
validation + Actuator health checks) needs more than one concurrent connection during bootstrap.
Pool sizing has to cover an application's *startup* needs, not just its steady-state request load.

**Fix**: size the pool to at least 2, even for the smallest deployments.

## PostgreSQL data disappears after a pod restart

**Symptom**: `/api/incidents` starts returning `500 relation "incidents" does not exist` after the
Postgres pod is recreated (deleted, evicted, or rescheduled).

**Root cause**: the pod's storage was an `emptyDir` volume, which is tied to that specific pod
instance and is discarded when the pod is replaced.

**Fix**: back Postgres's data directory with a `PersistentVolumeClaim` instead (see
`k8s/03-db.yaml`). Full explanation: [`architecture.md`](architecture.md#why-a-persistentvolumeclaim-and-why-postgresql-persistence-matters).
