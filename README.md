# DeployWatch

DeployWatch is organized as a split workspace:

```text
DeployWatch/
  frontend/   Next.js SaaS frontend
  backend/    Node.js API, Prisma, BullMQ workers
  docs/       Architecture notes
  README.md
```

## Workspaces

### `frontend`

The frontend is a Next.js App Router application built with TypeScript, Tailwind CSS, React Query, and Recharts.

Typical commands:

```bash
cd frontend
npm install
npm run dev
```

### `backend`

The backend is a production-oriented Node.js + TypeScript service built with:

- Express
- PostgreSQL + Prisma ORM
- BullMQ + Redis
- Zod validation

Typical commands:

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Start workers in a second terminal:

```bash
cd backend
npm run dev:worker
```

## Docs

Architecture notes live in [docs/architecture.md](/Users/chinmayk/Projects/DeployWatch/docs/architecture.md).

## Docker

The repository includes a root [docker-compose.yml](/Users/chinmayk/Projects/DeployWatch/docker-compose.yml) that runs:

- `frontend`
- `backend`
- `worker`
- `postgres`
- `redis`

Start everything:

```bash
docker compose up --build
```

The app will be available at:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`

The Compose stack also runs a one-shot migration container that applies the Prisma schema with `prisma db push` before the API and worker start.
