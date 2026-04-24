# DeployWatch Architecture Notes

## Repository layout

```text
DeployWatch/
  frontend/
  backend/
  docs/
```

## Docker layout

The repository is designed to run as a five-service Docker Compose stack:

- `frontend`: Next.js production container
- `backend`: Express API container
- `worker`: BullMQ worker container
- `postgres`: primary application database
- `redis`: queue and scheduling backend

An additional one-shot `backend-migrate` container applies the Prisma schema before the API and worker start.

## Backend overview

The backend is split into domain modules under `backend/src/modules`:

- `auth`
- `projects`
- `apis`
- `monitoring`
- `logs`
- `incidents`
- `alerts`

Each module contains:

- controller
- service
- repository
- routes
- schema
- types

## Monitoring flow

1. The BullMQ dispatcher scheduler runs on a fixed interval.
2. The dispatcher worker claims APIs whose `nextCheckAt` is due.
3. For each due API, a monitoring job is queued.
4. The monitoring worker performs the HTTP request and records a log row.
5. Detection logic evaluates:
   - consecutive failures
   - latency threshold breaches
6. If thresholds are crossed, incidents are opened or updated.
7. Alert events are created and sent through the alert queue.
8. The alert worker performs mock delivery for email, Slack, or webhook channels.

## Data model

Core tables:

- `User`
- `Project`
- `AlertPolicy`
- `MonitoredApi`
- `ApiCheckLog`
- `Incident`
- `IncidentEvent`
- `AlertEvent`

Key design choices:

- `MonitoredApi.nextCheckAt` lets the dispatcher claim due work without tight coupling to API routes.
- `ApiCheckLog` stores timestamped request outcomes for dashboarding and log exploration.
- `Incident` and `IncidentEvent` separate incident state from timeline history.
- `AlertPolicy` is project-scoped, which keeps the MVP simple while leaving room for API-level overrides later.

## API shape

Primary route groups:

- `/v1/auth`
- `/v1/projects`
- `/v1/projects/:projectId/apis`
- `/v1/projects/:projectId/logs`
- `/v1/projects/:projectId/incidents`
- `/v1/projects/:projectId/alerts`
- `/v1/monitoring`

## Operational notes

- The API server and workers are intentionally separate processes.
- Prisma is generated from `backend/prisma/schema.prisma`.
- Redis is required for BullMQ queues.
- PostgreSQL is required for the Prisma datasource.
