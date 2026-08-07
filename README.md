# OpsPilot AI

An AI-powered operations assistant built with Spring Boot. OpsPilot AI aims to reduce manual toil for engineering and operations teams by surfacing insights, automating routine tasks, and providing a conversational interface for infrastructure management.

## Project Status

Early development. Core REST API infrastructure is in place. AI features and integrations are actively being designed and built.

## Tech Stack

- **Java 21** (Eclipse Temurin LTS)
- **Spring Boot 4.1** — REST API framework
- **Spring Data JPA / Hibernate** — database access
- **PostgreSQL** — primary data store
- **Maven** — build and dependency management

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Returns a simple service health string |
| GET | `/actuator/health` | Spring Boot Actuator health, including PostgreSQL connectivity |
| GET | `/actuator/info` | Build metadata (name, version, build time) |
| GET | `/actuator/metrics` | List of available Micrometer metric names |

## Configuration Profiles

The application uses Spring profiles to separate environment-specific behavior from source code:

- **`dev`** (`application-dev.properties`) — the default profile. Ships with safe, non-sensitive
  fallback values so the app runs against a locally installed PostgreSQL instance with no extra
  setup: verbose SQL logging and full Actuator health detail (`show-details=always`).
- **`prod`** (`application-prod.properties`) — used by the Docker image (see `docker-compose.yml`,
  which sets `SPRING_PROFILES_ACTIVE=prod`). SQL logging is disabled and Actuator health detail is
  restricted (`show-details=when-authorized`) so unauthenticated callers only see the aggregate
  `UP`/`DOWN` status, not internal component details. Database credentials have **no default** in
  this profile — the app fails fast on startup if they are not supplied.

Shared, environment-agnostic settings (app name, Flyway config, which Actuator endpoints are
exposed, CORS defaults) live in the base `application.properties`. Anything that differs between
a developer's laptop and a deployed instance — credentials, log verbosity, how much health detail
to expose — lives in the profile-specific file instead.

Select a profile via the `SPRING_PROFILES_ACTIVE` environment variable; it defaults to `dev` if unset:

```bash
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run
```

## Environment Variables

| Variable | Used by | Purpose | Local default |
|----------|---------|---------|----------------|
| `SPRING_PROFILES_ACTIVE` | both | Selects `dev` or `prod` profile | `dev` |
| `DB_URL` | both | JDBC URL for PostgreSQL | `jdbc:postgresql://localhost:5432/opspilot` (dev only) |
| `DB_USERNAME` | both | Database username | `pushpendramukati` (dev only) |
| `DB_PASSWORD` | both | Database password | empty (dev only) |
| `CORS_ALLOWED_ORIGINS` | both | Allowed origin(s) for the API and Actuator endpoints | `http://localhost:5173` |

The `prod` profile intentionally has **no defaults** for `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` — set
them as real environment variables (or inject them from a secret manager) when running that profile.

For `docker-compose`, copy `.env.example` to `.env` and set a real `POSTGRES_PASSWORD` — the stack
will refuse to start without it (see [Secrets](#secrets)).

## Secrets

No real credentials are committed to this repository:

- The `dev` profile has a non-sensitive local default for `DB_USERNAME` only (matches a locally
  installed PostgreSQL trust-auth setup); `DB_PASSWORD` has no default value — it comes from an
  environment variable, or an untracked `application-local.properties` (see `.gitignore`), or is
  simply blank for a local trust-auth database.
- The `prod` profile has **no credential defaults at all** — `DB_URL`, `DB_USERNAME`, and
  `DB_PASSWORD` must be supplied as real environment variables, and the app fails fast on startup
  if they're missing.
- `docker-compose.yml` requires `POSTGRES_PASSWORD` to be set (via a local `.env` file or the shell
  environment) and will refuse to start otherwise — see `.env.example` for the variables to copy
  into your own untracked `.env`.

`.gitignore` excludes `.env`, `*.env`, and `application-local.properties`/`.yml`, so local secret
overrides never get accidentally committed. Never hardcode a real password, API key, or connection
string into a tracked file (`application-*.properties`, `docker-compose.yml`, etc.) — always source
it from the environment.

Because every secret already flows in purely through environment variables, this is ready to plug
into a platform secret store later without code changes: an AWS ECS task definition can inject
`DB_USERNAME`/`DB_PASSWORD` from AWS Secrets Manager, and a Kubernetes Deployment can source the
same variables from a `Secret` via `envFrom`/`secretKeyRef` — the application and `application-prod.properties`
don't need to know or care which one is providing them.

## Actuator Health & Metrics

Spring Boot Actuator is enabled with `health`, `info`, `metrics`, and `prometheus` exposed. With the
app running:

```bash
curl http://localhost:8080/actuator/health   # {"status":"UP"} (or DOWN if PostgreSQL is unreachable)
curl http://localhost:8080/actuator/info     # build name/version/time
curl http://localhost:8080/actuator/metrics  # list of available metric names
```

PostgreSQL connectivity is reflected automatically: Spring Boot auto-registers a database health
indicator whenever a `DataSource` is present, so `/actuator/health` (and its aggregate status)
flips to `DOWN` if the database becomes unreachable, and back to `UP` once it recovers. In the
`prod` profile, only the aggregate status is shown to unauthenticated callers; the `dev` profile
also shows per-component detail (e.g. `components.db.status`).

## Docker Health Checking

The backend image (`Dockerfile`) declares a `HEALTHCHECK` that polls `/actuator/health` every 30
seconds. `docker-compose.yml` wires this into the stack's startup order:

- `app` waits for `db` to report healthy (via Postgres's own `pg_isready` healthcheck) before starting.
- `frontend` waits for `app` to report healthy (via the `/actuator/health`-based Docker healthcheck)
  before starting.

Run `docker compose up --build` and then `docker ps` to see each service's health status, or
`docker inspect --format='{{.State.Health.Status}}' opspilot-ai-app-1` for just the backend.

## Planned Features

- Natural language interface for querying infrastructure state
- Automated incident triage and runbook suggestions
- Integration with monitoring tools (Prometheus, Grafana, PagerDuty)
- Audit logging and operations history
- Role-based access control

## Prerequisites

- Java 21 (Eclipse Temurin recommended)
- PostgreSQL running locally
- A database named `opspilot` created in PostgreSQL

## Running Locally

1. Clone the repository:
   ```bash
   git clone git@github.com:Pushpendra15899/opspilot-ai.git
   cd opspilot-ai
   ```

2. (Optional) Override the dev defaults if your local PostgreSQL user/password differ:
   ```bash
   export DB_USERNAME=your_postgres_username
   export DB_PASSWORD=your_postgres_password
   ```
   The `dev` profile is active by default and already has a working local default, so this step is
   only needed if your setup differs from it — see [Environment Variables](#environment-variables).

3. Start the application:
   ```bash
   ./mvnw spring-boot:run
   ```

4. Verify it is running:
   ```bash
   curl http://localhost:8080/api/health
   curl http://localhost:8080/actuator/health
   ```
