# Product Requirements Document (PRD)

Updated: 2026-05-17

## 1. Product Summary
Rensa is a photo-sharing community focused on reproducible photography "recipes".  
Users upload photos with metadata, discover others' work, save to rolls, bookmark, and comment.

## 2. Problem Statement
Most photo communities emphasize end results but not repeatable capture settings.  
Rensa solves this by combining image sharing with structured metadata and community interaction.

## 3. Personas
- Creator photographer: uploads and shares recipes.
- Explorer photographer: browses photos and saves references.
- Collector: organizes inspiration via rolls/bookmarks.
- Moderator/admin: reviews contact and bug-report queues.

## 4. Product Goals
1. Reliable upload + metadata capture workflow.
2. Fast discovery and retrieval of relevant photos.
3. Personal collection management (rolls/bookmarks).
4. Safe collaboration (comments/notifications) with abuse controls.
5. Operational visibility for support and bug triage.

## 5. In-Scope Features (As Implemented)
### 5.1 Auth and Session
- Credentials auth via NextAuth + Drizzle adapter.
- Email verification and password reset routes are implemented.
- Session payload includes `user.id` and `user.role`.

### 5.2 Photo Domain
- List photos with pagination, sort, and filters.
- Get photo by id and owner id.
- Delete photo with ownership check.
- Upload pipeline:
image compression (`sharp`) -> NSFW model call (`FAST_API_BASE_URL`) -> Cloudinary upload -> metadata persistence.

### 5.3 Rolls
- List rolls by user.
- Get default roll.
- Create/update/delete roll with owner authorization.
- Add/remove photo in roll.
- Query whether a photo is saved to any roll.

### 5.4 Bookmarks
- Toggle bookmark on photo through add/remove bookmark semantics.
- List user's bookmarked photos.

### 5.5 Comments and Notifications
- Create/list comments per photo.
- Server-created notifications for photo bookmark, comment, and roll-save events.
- List notifications; mark read; clear by user.
- WebSocket notification consumption in client (`NotificationProvider`).

### 5.6x Support and Admin Ops
- Contact form submit and admin list endpoint.
- Bug report submit and admin list endpoint.
- Confirmation and admin emails via Resend templates.

## 6. API Surface (Current)
Core route groups under `src/app/api`:
- `/auth/*`
- `/email/*`
- `/photos/*`
- `/rolls/*`
- `/users/[id]`
- `/profile/[id]`
- `/notifications/*`

Contract documentation:
- Machine-readable: `/api/docs`
- Human-readable reference: `docs/API_CONTRACTS.md`

## 7. User Requirements
- `UR-001` As a user, I can register, verify my email, log in, and log out to access my account securely.
- `UR-002` As a creator, I can upload a photo with recipe metadata so others can reproduce my results.
- `UR-003` As an explorer, I can browse and filter photos to find relevant styles quickly.
- `UR-004` As a collector, I can create and manage rolls, then add/remove photos from those rolls.
- `UR-005` As a user, I can bookmark photos and review my saved references later.
- `UR-006` As a community member, I can comment on photos and receive notification updates.
- `UR-007` As a user, I can reset my password and recover access without admin intervention.
- `UR-008` As an admin/support operator, I can review contact and bug-report submissions in a queryable queue.
- `UR-009` As a moderator/admin, I can curate photos (review, keep, or remove policy-violating content) to maintain community quality and safety.

## 8. Functional Requirements
### FR-001 Authentication and Session
- The system shall support credential registration, login, logout, email verification, and password reset flows.
- The session token payload shall expose `user.id` and `user.role` for authorization checks.

### FR-002 Authorization and Ownership
- The system shall enforce authenticated actor identity for all protected write endpoints.
- The system shall reject mutations to photo and roll resources when requester ownership does not match resource owner.

### FR-003 Photo Upload and Safety Pipeline
- The system shall validate uploaded file type, metadata payload, and request size before persistence.
- The system shall run upload processing in sequence: compression (`sharp`) -> NSFW check (`FAST_API_BASE_URL`) -> Cloudinary upload -> metadata persistence.
- The system shall enforce upload rate limiting by client IP.
- The system shall reject policy-violating uploads and return structured error responses.

### FR-004 Discovery and Retrieval
- The system shall provide paginated photo and roll listing endpoints with deterministic ordering and bounded limits.
- The system shall provide read endpoints for photo detail, roll detail, owner lookup, and profile lookup.
- The system shall provide EXIF extraction endpoint support for upload assistance.

### FR-005 Roll and Bookmark Management
- The system shall support create/read/update/delete roll operations for resource owners.
- The system shall support adding and removing photos to/from a roll for authorized owners.
- The system shall provide a query to determine whether a photo is saved in any of the user's rolls.
- The system shall support adding/removing photo bookmarks and bookmarked photo retrieval.

### FR-006 Comments and Notifications
- The system shall support creating and listing comments per photo.
- The system shall create notifications server-side for photo bookmark, comment, and roll-save events.
- The system shall support listing and marking notifications as read, including clear-by-user semantics.
- The client shall consume real-time notification updates through websocket integration.

### FR-007 Support and Bug Reporting Operations
- The system shall accept contact and bug-report submissions and store them as structured records.
- The system shall send confirmation and admin notification emails for support workflows.
- The system shall restrict support and bug-report list endpoints to admin-role users.

### FR-008 API Contract Availability
- The system shall expose machine-readable API contracts at `GET /api/openapi`.
- The system shall expose interactive API documentation at `/swagger` (development open, production admin-only).

## 9. Non-Functional Requirements
### NFR-001 Availability and Reliability
- The system shall return explicit, structured error responses for failed requests and avoid silent failures.
- The system shall degrade gracefully when dependent services (Cloudinary, NSFW service, websocket service, email provider) are unavailable.

### NFR-002 Security and Abuse Prevention
- The system shall validate and sanitize request inputs before domain processing.
- The system shall enforce authentication and role/ownership authorization on protected resources.
- The system shall apply rate limiting to auth- and upload-related endpoints.

### NFR-003 Performance and Scalability
- List APIs shall support pagination with bounded defaults and hard limits (`limit <= 50`).
- The system shall maintain p95 latency targets for key read endpoints tracked in Success Metrics.

### NFR-004 Maintainability and Consistency
- Core domains shall follow layered boundaries (`route -> service -> repository`).
- Canonical naming and contracts (for example `bookmarks`) shall be consistent across routes, DTOs, and docs.
- Application and API naming shall use `camelCase`; physical database column names shall remain `snake_case`.
- Product and API docs under `/docs` shall be updated when architecture or contract behavior changes.

### NFR-005 Testability and Operability
- Critical workflows (auth, upload, roll/bookmark mutation, comment creation, support intake) shall have route/service test coverage.
- Operational metrics for upload success, endpoint latency, auth failures, and triage SLA shall be measurable.

## 10. Known Gaps and Risks (Current State)
1. Bookmark data consistency.
- `bookmarks` is the canonical terminology and data contract for saved photos.
2. Auth/profile consistency.
- NextAuth identity source and application user profile must stay aligned in PostgreSQL-backed records.
3. Operational coupling.
- Notifications depend on external Elysia service and websocket endpoint.

## 11. Success Metrics
- Photo upload success rate excluding policy rejection.
- p95 latency for `GET /api/photos`, `GET /api/rolls`, `GET /api/rolls/[id]/photos`.
- Bookmark toggle success/error rate.
- Comment post success rate.
- Contact and bug-report triage SLA (time-to-first-review).
- Auth rate-limit hit rate and failed-login ratio.

## 12. Out of Scope
- Native mobile clients.
- Third-party public API.
- In-app editing suite.
- Payments/marketplace.

## 13. Pre-Refactor Exit Criteria
Before continuing large refactors:
1. Data model naming alignment for bookmarks remains enforced across code and docs.
2. One canonical user profile store is chosen and documented.
3. Every API route declares authoritative source of truth for its entities.
4. Docs in `/docs` remain versioned and updated with each architecture decision.
