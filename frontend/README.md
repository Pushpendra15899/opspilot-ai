# OpsPilot Frontend

React + TypeScript operations console for OpsPilot. See the [repository root README](../README.md)
for the full project overview, architecture, and setup instructions.

## Quick reference

```bash
npm ci          # install
npm run dev     # http://localhost:5173, proxies /api and /actuator to localhost:8080
npm run lint    # oxlint
npm run build   # tsc -b (type-check) && vite build
```

## Structure

```
src/
├── pages/          # route-level views (Dashboard, Incidents, Observability, API Docs)
├── components/      # ui/ (design system primitives), dashboard/, incidents/, observability/
├── api/             # axios calls to the backend REST + Actuator endpoints
├── hooks/           # TanStack Query hooks wrapping the api/ layer
├── lib/             # formatting, presentation, and small pure helpers
└── types/           # shared TypeScript types matching backend DTOs
```

The dev server proxy (`vite.config.ts`) forwards `/api`, `/actuator`, `/v3/api-docs`, and
`/swagger-ui` to `http://localhost:8080`, so the frontend can talk to a backend running either via
`./mvnw spring-boot:run`, Docker Compose, or `kubectl port-forward` without any code changes.