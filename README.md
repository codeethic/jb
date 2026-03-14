# FeatureBoard

A web application for restaurants to plan, manage, and publish rotating menu features and daily specials.

## Tech Stack

- **Frontend:** Next.js + React + TypeScript + TailwindCSS
- **Backend:** NestJS + TypeORM + PostgreSQL
- **Shared:** Common types, enums, and utilities

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (for local PostgreSQL)

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Seed the database
pnpm db:seed

# 5. Start development servers
pnpm dev
```

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001

## Demo Credentials

| Role    | Email             | Password    |
|---------|-------------------|-------------|
| Admin   | admin@demo.com    | password123 |
| Manager | manager@demo.com  | password123 |
| Chef    | chef@demo.com     | password123 |
| Server  | server@demo.com   | password123 |

## Project Structure

```
apps/
  api/          — NestJS backend (port 3001)
  web/          — Next.js frontend (port 3000)
packages/
  shared/       — Shared types, enums, constants
```

## Commands

| Command            | Description                       |
|--------------------|-----------------------------------|
| `pnpm dev`         | Start all apps in dev mode        |
| `pnpm build`       | Build all packages                |
| `pnpm test`        | Run all tests                     |
| `pnpm lint`        | Lint all packages                 |
| `pnpm format`      | Format code with Prettier         |
| `pnpm db:seed`     | Seed database with sample data    |
| `pnpm db:migrate`  | Run database migrations           |

## Architecture

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for coding conventions and [doc/prd.md](doc/prd.md) for product requirements.