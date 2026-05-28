# Architecture Decision Record (ADR)

Updated: 2026-05-17

This document captures active architecture decisions and transitional decisions
for the current Rensa codebase.

## ADR-001: Next.js App Router as Web + API Entry Layer
- Status: Accepted
- Date: 2026-04-13
- Context: UI and API are colocated in one Next.js application.
- Decision:
Use `src/app/**` for pages/layouts and `src/app/api/**/route.ts` for HTTP controllers.
- Consequences:
Single deployment unit and straightforward routing.
Requires strict boundaries so route files do not absorb business logic.

## ADR-002: Layered Backend for Core Domain Modules
- Status: Accepted
- Date: 2026-04-13
- Context:
Users/photos/rolls/comments/contacts/notifications are organized in backend
modules with DTOs, services, and repositories.
- Decision:
Keep `route -> service -> repository` as the canonical shape.
- Consequences:
Improved testability and clearer ownership.
Some legacy routes still bypass this pattern and should be migrated.

## ADR-003: PostgreSQL + Drizzle as Source of Truth for Core Domain
- Status: Accepted (Target), In Progress
- Date: 2026-04-13
- Context:
Repositories use Drizzle ORM and migration files define relational tables.
- Decision:
Converge core domain persistence on PostgreSQL + Drizzle.
- Consequences:
Relational consistency and easier cross-entity queries.
Requires strict enforcement so new features do not introduce non-PostgreSQL persistence.

## ADR-004: PostgreSQL-Only Persistence Policy
- Status: Accepted
- Date: 2026-04-13
- Context:
The project requires one canonical persistence model for scalability and consistency.
- Decision:
Use PostgreSQL only for application persistence.
- Consequences:
Eliminates cross-store drift and split-brain identity risks.
Any remaining legacy non-PostgreSQL paths should be refactored or removed.

## ADR-005: NextAuth with Drizzle Adapter for Session/Auth Infrastructure
- Status: Accepted
- Date: 2026-04-13
- Context:
Authentication is managed with NextAuth and `next_auth` schema tables.
- Decision:
Continue using NextAuth + Drizzle adapter, with JWT/session callbacks enriching
`user.id` and `user.role`.
- Consequences:
Reliable auth/session abstraction.
Application user profile source must be consistent with auth identity source.

## ADR-006: Upload Pipeline Security Stack
- Status: Accepted
- Date: 2026-04-13
- Context:
Photo uploads are high-risk entry points.
- Decision:
Use layered defenses:
rate-limit -> sanitize metadata -> image compression -> NSFW check -> Cloudinary
upload -> URL validation.
- Consequences:
Improved abuse resistance.
External dependency chain (FastAPI moderation + Cloudinary) impacts availability.

## ADR-007: API Contract Validation with Zod DTOs
- Status: Accepted
- Date: 2026-04-13
- Context:
Typed and validated API boundaries are required for reliability.
- Decision:
Keep DTO definitions under `src/backend/dtos` and parse request params/query/body
at route boundaries.
- Consequences:
Lower malformed-input risk.
Contract maintenance required for every endpoint change.

## ADR-012: OpenAPI + Swagger as API Contract Delivery
- Status: Accepted
- Date: 2026-04-13
- Context:
The project needs a stable API contract for future integrations and refactors.
- Decision:
Expose OpenAPI JSON at `/api/openapi` and Swagger UI at `/swagger`.
- Consequences:
Improves discoverability and integration velocity.
Requires contract updates whenever endpoints or payloads evolve.

## ADR-008: Notification Service as External Boundary
- Status: Accepted
- Date: 2026-04-13
- Context:
Notification repository delegates to external Elysia API and client websocket.
- Decision:
Treat notifications as an integration boundary, not local persistence.
- Consequences:
Decouples notification subsystem implementation.
Requires robust fallback behavior on external outage.

## ADR-009: Data Model Naming Alignment for Bookmarking
- Status: Proposed
- Date: 2026-04-13
- Context:
Bookmark terminology and storage naming must remain consistent across contracts,
repositories, and migrations.
- Decision:
Standardize on one table and one DTO naming vocabulary across migration,
repositories, and API response fields.
- Consequences:
Eliminates query ambiguity and migration defects.
Requires migration patch + repository update + regression tests.

## ADR-010: Profile and Identity Canonical Store Unification
- Status: Proposed
- Date: 2026-04-13
- Context:
Profile and auth identity must resolve from the same PostgreSQL-backed user records.
- Decision:
Unify profile read/write to the same canonical user store as auth-linked
application user records.
- Consequences:
Removes split-brain user state.
Requires migration scripts and rollout plan for existing profile data.

## ADR-011: Route-Module Consistency Standard
- Status: Proposed
- Date: 2026-04-13
- Context:
Some routes still embed service logic directly.
- Decision:
All non-trivial route handlers should delegate to backend modules and use shared
error mapping (`BackendError` family) for consistency.
- Consequences:
More uniform observability and error handling.
Short-term refactor effort for legacy handlers.

## ADR-013: Application Naming Uses camelCase
- Status: Accepted
- Date: 2026-05-17
- Context:
The codebase spans frontend components, Next.js API routes, backend DTOs/services,
Drizzle schemas, SQL migrations, and generated documentation. Mixed `snake_case`
and `camelCase` across application boundaries previously caused API drift and
renames such as `avatar` versus `avatarUrl`.
- Decision:
Use `camelCase` for all TypeScript application identifiers and API contracts,
including frontend props/state, DTO fields, route params, query params, request
bodies, response bodies, service params, repository params, and Drizzle schema
property keys.

Keep `snake_case` for physical PostgreSQL identifiers only: table columns,
indexes, constraints, SQL migrations, and ERD fields that describe database
columns. Drizzle schema definitions bridge the two forms by using a camelCase
property mapped to a snake_case column string, for example:

```ts
avatarUrl: text("avatar_url")
```

External providers that expose `snake_case` fields must be normalized at the
boundary, for example `secure_url` from Cloudinary should become `secureUrl`
before it is passed into domain code.
- Consequences:
Frontend/backend contracts stay idiomatic and consistent.
Database migrations remain compatible with existing PostgreSQL naming.
Schema changes require explicit review to distinguish TypeScript-only property
renames from physical database column renames.
