# DeployWatch

## The Problem

Engineering teams often suffer from silent API failures and gradual latency degradation. Traditional ping monitors are too simplistic, while enterprise observability platforms are overly complex, deeply coupled with the infrastructure, and expensive. When an endpoint goes down or experiences heavy load, teams need immediate, reliable alerts decoupled from the failing system itself—without the overhead of installing massive server agents or dealing with noisy, uncoordinated incident reports.

## The Solution

DeployWatch is a high-frequency polling and automated incident response platform designed to be both lightweight and highly resilient. 

It solves the problem through a decoupled, event-driven architecture:
- **Decoupled Task Queues:** Uses BullMQ and Redis to isolate the monitoring workloads. A dispatcher worker schedules APIs due for checks without being tightly coupled to cron jobs or tying up request cycles.
- **Resilient Polling:** Target API timeouts, worker node crashes, or database connection spikes won't crash the monitoring engine. Stalled jobs are automatically re-assigned to active workers.
- **Smart Detection:** Instead of alerting on single blips, the detection logic evaluates consecutive failures and latency threshold breaches over time to prevent alert fatigue.
- **Automated Incident Response:** When an outage is confirmed, DeployWatch automatically opens an incident, logs the historical timeline, and asynchronously fires off alerts (Email, Slack, Webhooks) using a dedicated worker to ensure rapid response times.

---

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
