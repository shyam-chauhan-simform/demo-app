# Demo App — File Upload & Async Processing

A small demo that mirrors the architecture diagram: a React SPA and NestJS API
running in a container-apps-style environment, backed by Postgres and Blob
Storage, with a Worker app doing async background processing off a queue.

## Architecture mapping

| Diagram box                          | This demo                                             |
| ------------------------------------- | ------------------------------------------------------ |
| React Web SPA                         | `apps/web` — Vite + React, polls the API every 2s       |
| NestJS API                            | `apps/api` — upload/list/download endpoints            |
| Worker App (KEDA-scaled)              | `apps/worker` — BullMQ consumer, `WORKER_CONCURRENCY` env var stands in for KEDA replica scaling |
| PostgreSQL Flexible                   | `postgres` container (file metadata + status)          |
| Blob Storage                          | `azurite` container (Azure Storage emulator)            |
| Service Bus (queue side)              | `redis` + BullMQ (stand-in for Service Bus/queueing)    |
| Azure Container Apps Env              | `docker-compose.yml` running all three apps together   |

Disaster-recovery features from the diagram (read replicas, geo-paired
namespaces, RA-GRS) aren't simulated locally — this demo is about the
request/data flow, not HA topology.

## What it does

1. Upload a file from the React SPA.
2. The API stores the file in Blob Storage (Azurite) and a `files` row in
   Postgres with `status = pending`, then enqueues a `file-processing` job.
3. The Worker picks up the job, downloads the blob, computes a sha256 hash
   (and word/line/char counts for text files), and updates the row to
   `completed` (or `failed` with an error).
4. The SPA polls `GET /files` and shows live status badges plus a download
   link once processing completes.

## Running with Docker (recommended)

```bash
docker compose up --build
```

- Web: http://localhost:5173
- API: http://localhost:3000/files

## Running locally without full Docker

Start just the infra in Docker, run the apps with Node:

```bash
npm install
docker compose up -d postgres azurite redis

npm run dev:api     # http://localhost:3000
npm run dev:worker
npm run dev:web      # http://localhost:5173
```

Copy `.env.example` to `.env` in `apps/api` and `apps/worker` if you need to
override connection settings (defaults match the Docker Compose services).

## Project layout

```
apps/
  api/      NestJS — REST endpoints, TypeORM entity, BullMQ producer, blob upload/download
  worker/   Node + TypeScript — BullMQ consumer, blob download, Postgres update
  web/      React + Vite — upload form, polling file list
docker-compose.yml   postgres + azurite + redis + the three apps
```
