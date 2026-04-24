# DeployWatch Backend

Production-style backend for monitoring third-party APIs, recording health signals, detecting incidents, and dispatching alerts.

## Stack

- Node.js
- TypeScript
- Express
- PostgreSQL with Prisma
- BullMQ with Redis
- Zod

## Folder structure

```text
src/
  modules/
  shared/
  workers/
  jobs/
  config/
  db/
  middlewares/
  utils/
  types/
  server.ts
```

## Modules

- `auth`: signup, login, current-user lookup
- `projects`: project CRUD and dashboard summaries
- `apis`: monitored API CRUD
- `monitoring`: scheduling, manual runs, execution, detection
- `logs`: request log querying
- `incidents`: incident listing and detail timelines
- `alerts`: alert policy management and delivery orchestration

## Local setup

1. Copy `.env.example` to `.env`.
2. Ensure PostgreSQL and Redis are running.
3. Install dependencies:

```bash
npm install
```

4. Generate the Prisma client:

```bash
npm run prisma:generate
```

5. Apply schema changes to your local database:

```bash
npm run prisma:push
```

6. Start the API:

```bash
npm run dev
```

7. Start the workers in another terminal:

```bash
npm run dev:worker
```

## Verification

The codebase was verified with:

```bash
npm run prisma:generate
npm run lint
npm run build
```

## Docker

This workspace is containerized through the root [docker-compose.yml](/Users/chinmayk/Projects/DeployWatch/docker-compose.yml).

Useful commands:

```bash
docker compose up --build
docker compose up backend worker postgres redis
docker compose logs -f backend worker
docker compose down -v
```
