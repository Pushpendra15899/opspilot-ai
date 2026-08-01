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
| GET | `/api/health` | Returns service health status |

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

2. Set your database credentials as environment variables:
   ```bash
   export DB_USERNAME=your_postgres_username
   export DB_PASSWORD=your_postgres_password
   ```

3. Start the application:
   ```bash
   ./mvnw spring-boot:run
   ```

4. Verify it is running:
   ```bash
   curl http://localhost:8080/api/health
   ```
