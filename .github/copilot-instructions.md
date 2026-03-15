# Copilot Instructions — FeatureBoard

## What Is This Project?

FeatureBoard is a web application for restaurants to plan, manage, and publish rotating menu features and daily specials. It replaces spreadsheet-based workflows with a collaborative system shared between kitchen and front-of-house staff. See `doc/prd.md` for the full product requirements.

## Architecture

- **Frontend:** React + Next.js + TypeScript + TailwindCSS + shadcn/ui
- **Backend:** NestJS (Node/TypeScript) REST API with JWT authentication
- **Database:** PostgreSQL
- **Deployment:** Vercel for the frontend (current); backend deployment-agnostic

**Portability is a first-class concern.** The system must not be locked to any specific cloud vendor or database engine:
- No direct imports of cloud-provider SDKs (AWS, GCP, Azure) in business logic — wrap them behind interfaces in an infrastructure layer.
- No Vercel-specific APIs (`@vercel/*`) in shared or backend code. Frontend may use Next.js features but avoid `vercel.json`-only capabilities.
- Database access goes through a repository abstraction (see Backend section). Switching from PostgreSQL to another SQL engine should require only a new repository implementation and connection config — zero changes to services or controllers.
- Store config (DB connection, JWT secret, API keys) in environment variables, validated at startup. Never hard-code provider-specific connection strings.

Core domain entities: `feature_items`, `scheduled_features`, `pairings`, `feature_categories`, `restaurants`, `users`, `performance_records`.

### Monorepo Layout

```
apps/
  web/          — Next.js frontend
  api/          — NestJS backend
packages/
  shared/       — Shared types, constants, validation schemas (used by both apps)
```

- Use npm/pnpm workspaces. Shared code lives in `packages/shared` and is imported by both apps.
- Never duplicate types between frontend and backend — define DTOs and enums once in `packages/shared`.
- Each app has its own `tsconfig.json` extending a root `tsconfig.base.json`.

### Local Development

- A single `pnpm dev` at the workspace root should start both frontend and backend (use `turbo` or `concurrently`).
- Backend connects to a local PostgreSQL instance; provide a `docker-compose.yml` at the repo root for Postgres + any other services (e.g., Redis if added later).
- Seed script (`pnpm db:seed`) populates the local DB with sample restaurant, users (one per role), categories, feature items, and a week of scheduled features.
- Use `.env.example` files in each app with all required vars documented. `.env` files are `.gitignore`d.
- Migrations run via a CLI command (`pnpm db:migrate`), never auto-synced in production.

### Key API Surface

```
GET/POST  /features      — Feature item library (CRUD)
GET/POST  /schedule       — Weekly scheduling of features to dates
GET       /today          — Today's published lineup (read-only, mobile-first)
GET       /pairings       — Wine pairing suggestions
GET       /reports        — Margin and performance data
```

## User Roles & Permissions

Four roles with escalating access — enforce these in every endpoint and UI route:
| Role    | Can Do                                           |
|---------|--------------------------------------------------|
| Server  | View daily lineup page only                      |
| Chef    | Create feature items, schedule, edit descriptions |
| Manager | Approve/publish features, edit pricing, reports   |
| Admin   | Manage users, configure categories, system config |

## Domain Conventions

- A **feature item** is a reusable menu entry (name, category, description, cost, price, allergens, tags, image).
- A **scheduled feature** ties a feature item to a `service_date` + `meal_period` (lunch/dinner) with a status: `draft`, `published`, or `86'd`.
- **Margin** = `(price - cost) / price`. Always compute and display margin % alongside cost/price.
- **Wine pairings** link a food feature item to a wine item with a pairing note.
- Categories default to: Appetizer, Soup, Fish, Entrée, Dessert, Wine. Users can add custom categories.

## MVP Scope

Only build what's in the MVP list (`doc/prd.md` §8): login, feature library, weekly schedule, publish daily lineup, mobile lineup page, print lineup sheet. Do **not** implement POS integration, sales analytics, AI recommendations, or inventory tracking unless explicitly asked.

## UI/UX Guidelines

- The daily lineup page must be **mobile-first and read-only** — servers use it on phones before shifts.
- The scheduling interface should support **drag-and-drop**, week duplication, and reordering.
- Print lineup sheets export to **PDF** or a clean print-friendly page.
- Target: servers learn the system in < 2 minutes; daily lineup viewable in < 60 seconds.

## Code Patterns

### General
- TypeScript strict mode in all packages (`"strict": true`).
- Use UUIDs for all primary keys.
- Store tags as JSON arrays on feature items.
- Dates are ISO 8601 (`YYYY-MM-DD`); meal periods are an enum (`lunch | dinner`).

### Frontend (`apps/web`)
- Use shadcn/ui components as the base; avoid raw HTML for form controls, buttons, dialogs.
- Colocate components: `components/features/`, `components/schedule/`, `components/lineup/`.
- Use React Server Components where possible; client components only when interactivity is needed.

### Backend (`apps/api`) — Separation of Concerns
- Organize NestJS code by domain module: `features/`, `schedule/`, `pairings/`, `auth/`, `users/`.
- Each module owns its **controller → service → repository** stack plus DTOs and entity.
  - **Controller:** HTTP concerns only — parse request, call service, return response. No business logic.
  - **Service:** All business rules (margin calculation, scheduling conflicts, status transitions). No HTTP or DB imports.
  - **Repository:** Data access only. Inject via interface so implementations are swappable (e.g., `TypeOrmFeatureRepository` today, `PrismaFeatureRepository` tomorrow).
- All API responses follow a consistent envelope: `{ data, error, meta }`.
- Use class-validator decorators on DTOs for request validation.
- Use Guards for role-based access (e.g., `@Roles('chef', 'manager')` + `RolesGuard`).
- Use TypeORM for database access, but **always behind repository interfaces** — no `getRepository()` calls in services.

### Lint & Formatting
- **ESLint** with `@typescript-eslint` — enforce no-unused-vars, no-explicit-any, consistent-type-imports.
- **Prettier** for formatting: 2-space indent, single quotes, trailing commas, 100 char line width.
- Run `lint` and `format:check` in CI. No lint warnings in committed code.

## Testing

Test coverage is a priority — every service, controller, and non-trivial component must have tests.

### Backend
- **Unit tests** for every service method with mocked repository interfaces. Test business logic in isolation — no database, no HTTP.
- **Integration tests** (NestJS testing utilities + supertest) for all API endpoints, covering each role's permissions and error cases.
- Repository implementations get their own integration tests against a test database (use `docker-compose.test.yml` or testcontainers).
- Target: **≥ 80% line coverage** for `apps/api/src`.

### Frontend
- Components that handle scheduling, lineup display, or form validation should have tests (React Testing Library).
- Test user-facing behavior, not implementation details.
- Target: **≥ 70% line coverage** for `apps/web/src`.

### General
- Tests live next to source files (`*.spec.ts` / `*.test.tsx`).
- Run all tests from the workspace root: `pnpm --filter api test`, `pnpm --filter web test`.
- CI must run `pnpm test` (all workspaces), `pnpm lint`, and `pnpm format:check` — PRs blocked on failure.

## Help Page Maintenance

There is a searchable help page at `/help` (accessible to all logged-in users). Its content lives in `apps/web/src/lib/help-content.ts`.

**Whenever you add, change, or remove a user-facing feature**, update the help content file:
- Add a new `HelpEntry` for new features (with descriptive `title`, appropriate `category`, relevant `keywords`, and clear `content`).
- Update existing entries if behaviour changes.
- Remove entries for deleted features.
- If a new category of help is needed, add it to the `HELP_CATEGORIES` array.

This ensures end-users can always find up-to-date documentation in the app.
