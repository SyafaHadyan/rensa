# Rensa

Rensa is a photography community platform for sharing reproducible camera recipes. Users can upload photos with structured capture metadata, browse and filter community work, save photos to rolls, bookmark references, comment, and receive notifications.

This repository is a pnpm/Turbo monorepo containing the web app and supporting services.

## Workspace

| Path                 | Package                | Purpose                                                                               |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| `apps/web`           | `@rensa/web`           | Next.js application, API routes, auth, upload pipeline, database schema, Swagger docs |
| `apps/notifications` | `@rensa/notifications` | Elysia/Bun notification API and WebSocket service                                    |
| `apps/workers`       | `@rensa/workers`       | Bun/BullMQ workers for notifications, email, and photo processing                    |
| `apps/exif`          | `@rensa/exif`          | Express service for JPEG EXIF extraction through `exiftool-vendored`                  |
| `apps/ai`            | `@rensa/ai`            | FastAPI NSFW image classifier service                                                 |
| `packages/*`         | shared packages        | Workspace packages reserved for shared code/config                                    |
| `docs`               | product docs           | PRD, ERD, API contracts, and ADRs                                                     |

## Prerequisites

- Node.js compatible with the app dependencies
- pnpm `10.33.2`
- Bun for `apps/notifications` and `apps/workers`
- Python with a virtual environment for `apps/ai`
- PostgreSQL
- Redis
- Cloudinary account for image storage
- Resend account for email workflows

## Install

```bash
pnpm install
```

For the AI service, create a Python virtual environment in `apps/ai` and install its requirements:

```bash
cd apps/ai
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
```

## Environment

Create local environment files per app. The web app expects values such as:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rensa
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-secret

NEXT_PUBLIC_APP_URL=http://localhost:3000

EXPRESS_BASE_URL=http://localhost:3003
ELYSIA_BASE_URL=http://localhost:3002/api
FAST_API_BASE_URL=http://localhost:3001

NEXT_PUBLIC_ELYSIA_WS_URL=ws://localhost:3002/api/ws
NEXT_PUBLIC_EXPLORE_SOURCE=database

REDIS_URL=redis://localhost:6379

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
NO_REPLY_EMAIL=
ADMIN_EMAIL=
CONTACT_NOTIFICATION_EMAIL=
DEV_TEAM_EMAIL=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

The web app uses `REDIS_URL` when it enqueues background work through
`@rensa/queue`, including notification jobs. Without Redis, user actions such as
bookmarking or commenting can succeed while the notification enqueue step only
logs an error.

`apps/notifications` uses:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rensa
NEXTAUTH_SECRET=replace-with-the-web-secret
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
PORT=3002
```

`NEXTAUTH_SECRET` must match between `apps/web`, `apps/workers`, and
`apps/notifications`; workers sign short-lived tokens with this secret and the
notification service verifies them.

`apps/workers` uses:

```env
PORT=3010
NEXTAUTH_SECRET=replace-with-shared-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

REDIS_URL=redis://localhost:6379

ELYSIA_BASE_URL=http://localhost:3002/api
FAST_API_BASE_URL=http://localhost:3001/api

BULL_BOARD_USERNAME=admin
BULL_BOARD_PASSWORD=replace-with-strong-password
```

`apps/exif` uses:

```env
CORS_ORIGIN=http://localhost:3000
PORT=3003
DEBUG=rensa:*
```

## Development

Run individual services from the repo root:

```bash
pnpm dev:web
pnpm dev:notifications
pnpm dev:workers
pnpm dev:exif
pnpm dev:ai
```

Or run all workspace dev scripts through Turbo:

```bash
pnpm dev:all
```

Default local ports:

| Service       | URL                            |
| ------------- | ------------------------------ |
| Web           | `http://localhost:3000`        |
| AI classifier | `http://localhost:3001/health` |
| Notifications | `http://localhost:3002/health` |
| EXIF reader   | `http://localhost:3003/health` |
| Workers       | `http://localhost:3010/health` |

Notification workflow in local development requires all of these to be running:

- Redis at `redis://localhost:6379`
- `pnpm dev:web`
- `pnpm dev:notifications`
- `pnpm dev:workers`

The web app enqueues notification jobs, the workers app consumes those jobs, and
the workers app posts to `apps/notifications` at `/api/notifications`.

## Database

The shared database schema and migrations live in `packages/db`:

```bash
pnpm --filter @rensa/db db:generate
pnpm --filter @rensa/db db:migrate
```

For local schema synchronization during development, you can also use:

```bash
pnpm --filter @rensa/db db:push
```

The notification tables and enum are part of the shared `@rensa/db` migration
set, so there is no separate notification-service migration command.

## Naming Conventions

Use `camelCase` everywhere in application code and API contracts:

- TypeScript variables, functions, DTO fields, service/repository params, React props, hooks, and frontend state.
- API request body fields, query parameters, path parameter names, and response fields.
- Drizzle schema property keys that application code imports and references.

Keep `snake_case` only for physical database identifiers that already exist in PostgreSQL:

- Drizzle column names inside column builders, for example `userId: uuid("user_id")`.
- SQL migration files, raw SQL, indexes, constraints, and database diagrams that describe actual table columns.

Example:

```ts
export const users = pgTable("users", {
  userId: uuid("user_id").primaryKey().defaultRandom(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
```

When integrating external providers that return `snake_case` fields, convert at the boundary before passing data deeper into the app:

```ts
const { secure_url: secureUrl } = uploadResult;
```

For schema changes, keep migration history append-only. If only a TypeScript property is renamed, preserve the existing database column string in Drizzle. If the physical column changes, generate and review a new migration before running `db:migrate`.

## Quality Checks

```bash
pnpm typecheck
pnpm lint
pnpm check
```

Use `pnpm fix` to run the configured Ultracite formatter/fixer.

## Documentation

- Product requirements: `docs/PRD.md`
- Entity relationship model: `docs/ERD.md`
- API contracts: `docs/API_CONTRACTS.md`
- Architecture decisions: `docs/ADR.md`
- Web API docs in development: `/api/docs`
- OpenAPI/Swagger contract references are generated from `apps/web/src/backend/shared/openapi`

## Core Features

- Credentials auth, email verification, password reset, and session authorization
- Photo upload with validation, image compression, NSFW check, Cloudinary storage, and metadata persistence
- EXIF extraction support for upload assistance
- Photo discovery with pagination, sorting, and filters
- Rolls for organizing saved photos
- Bookmark toggling and bookmarked photo retrieval
- Comments and notification workflows
- Contact and bug-report submission flows with admin review endpoints
