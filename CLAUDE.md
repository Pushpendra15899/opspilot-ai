# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
./mvnw spring-boot:run          # Start the application
./mvnw clean package            # Build executable JAR
./mvnw test                     # Run all tests
./mvnw test -Dtest=ClassName    # Run a single test class
./mvnw clean package -DskipTests
```

The app starts on port 8080 by default. Health check: `GET /api/health`

## Database

Requires a local PostgreSQL instance with a database named `opspilot`. The datasource username is `pushpendramukati`; set the password via `SPRING_DATASOURCE_PASSWORD` env var or `application.properties` (not committed). Hibernate DDL is set to `update`, so schema changes apply automatically on startup.

## Architecture

Spring Boot 3 / Java 21 REST service. Standard layered structure under `com.pushpendra.opspilot`:

- **controller/** — `@RestController` classes handling HTTP endpoints
- **OpspilotAiApplication.java** — main entry point

Dependencies: Spring Data JPA + PostgreSQL, Spring MVC, Spring Validation.

`spring.jpa.show-sql=true` is enabled, so SQL statements appear in logs during development.
