# API Contracts

Updated: 2026-05-17

Canonical machine contract: `GET /api/openapi`  
Interactive docs: `/swagger` (development open, production admin-only)

## Naming Convention

API contracts use `camelCase` for request bodies, query parameters, path parameter names, and response fields. Examples include `userId`, `photoId`, `recipientId`, `createdAt`, `updatedAt`, `avatarUrl`, and `isBookmarked`.

Database column names remain `snake_case` internally and must not leak into API payloads unless the endpoint is explicitly returning raw database metadata. Convert external or database-shaped fields at the route/service boundary.

## Auth

### `GET /api/auth/[...nextauth]`

- Auth: none
- Purpose: NextAuth handler endpoint
- Success: `200`

### `POST /api/auth/[...nextauth]`

- Auth: none
- Purpose: NextAuth handler endpoint
- Success: `200`

### `POST /api/auth/login`

- Auth: none
- Body: `{ email: string, password: string }`
- Success: `200` with `{ success, message, user }`
- Errors: `400`, `401`, `429`, `500`

### `POST /api/auth/logout`

- Auth: session required
- Success: `200`
- Errors: `401`, `429`

### `POST /api/auth/register`

- Auth: none
- Body: `{ username, email, password, confirmPassword }`
- Success: `201`
- Errors: `400`, `409`, `429`, `500`

### `POST /api/auth/reset-password`

- Auth: none
- Body: `{ token, password, confirmPassword }`
- Success: `200`
- Errors: `400`, `404`, `429`, `500`

### `POST /api/auth/verify-email`

- Auth: none
- Body: `{ token }`
- Success: `200`
- Errors: `400`, `404`, `500`

## Email

### `POST /api/email/send-verification`

- Auth: none
- Body: `{ email }`
- Success: `200`
- Errors: `400`, `429`, `500`

### `POST /api/email/forgot-password`

- Auth: none
- Body: `{ email }`
- Success: `200`
- Errors: `429`, `500`

### `POST /api/email/contact`

- Auth: none
- Body: `createContactDto`
- Success: `201` with `{ success, message, data: { id } }`
- Errors: `400`, `429`, `500`

### `GET /api/email/contact`

- Auth: admin role
- Query: `status`, `page`, `limit`
- Success: `200` with contacts and pagination
- Errors: `400`, `401`, `500`

### `POST /api/email/bug-reports`

- Auth: none
- Body: bug report payload
- Success: `201`
- Errors: `400`, `429`, `500`

### `GET /api/email/bug-reports`

- Auth: admin role
- Query: `status`, `severity`, `page`, `limit`, `sortBy`
- Success: `200` with records and pagination
- Errors: `401`, `500`

## Photos

### `GET /api/photos`

- Auth: none
- Query: `page`, `limit`, `sort`, `filters`
- Success: `200` paginated photos
- Errors: `400`, `500`

### `GET /api/photos/[id]`

- Auth: none
- Path: `id`
- Success: `200` with photo
- Errors: `400`, `404`, `500`

### `DELETE /api/photos/[id]`

- Auth: session owner
- Path: `id`
- Success: `200`
- Errors: `400`, `401`, `403`, `404`, `500`

### `GET /api/photos/[id]/owner`

- Auth: none
- Path: `id`
- Success: `200` with `{ ownerId }`
- Errors: `400`, `404`, `500`

### `POST /api/photos/[id]/comments`

- Auth: session required
- Path: `id`
- Body: `{ text }`
- Success: `201`
- Side effect: creates `photo-commented` notification for the photo owner.
- Errors: `400`, `401`, `404`, `500`

### `GET /api/photos/[id]/comments`

- Auth: none
- Path: `id`
- Query: `offset`, `limit`
- Success: `200`
- Errors: `400`, `500`

### `GET /api/photos/bookmark`

- Auth: none
- Query: `userId`, `page`, `limit`
- Success: `200` paginated bookmarked photos
- Errors: `400`, `500`

### `GET /api/photos/[id]/bookmark`

- Auth: session required
- Path: `id`
- Success: `200` with `{ success, data: { isBookmarked, bookmarkCount } }`
- Errors: `400`, `401`, `404`, `500`

### `PUT /api/photos/[id]/bookmark`

- Auth: session required
- Path: `id`
- Success: `200` with `{ success, data: { isBookmarked, bookmarkCount } }`
- Side effect: creates `photo-bookmarked` notification for the photo owner when a new bookmark is inserted.
- Errors: `400`, `401`, `404`, `500`

### `DELETE /api/photos/[id]/bookmark`

- Auth: session required
- Path: `id`
- Success: `200` with `{ success, data: { isBookmarked, bookmarkCount } }`
- Errors: `400`, `401`, `403`, `404`, `500`

### `POST /api/photos/exifread`

- Auth: none
- Body: multipart form data
- Success: `200` with metadata
- Errors: `500`

### `POST /api/photos/upload`

- Auth: session required
- Body: multipart form data (file + metadata)
- Success: `200` with uploaded photo
- Errors: `400`, `401`, `429`, `500`

## Rolls

### `GET /api/rolls`

- Auth: none
- Query: `userId`, `sort`
- Success: `200`
- Errors: `400`, `500`

### `POST /api/rolls`

- Auth: session required
- Body: `{ name, description?, imageUrl? }`
- Success: `201`
- Errors: `400`, `401`, `500`

### `GET /api/rolls/default`

- Auth: session required
- Success: `200`
- Errors: `401`, `404`, `500`

### `GET /api/rolls/is-saved`

- Auth: session required
- Query: `photoId`
- Success: `200` with saved roll ids
- Errors: `400`, `401`, `500`

### `GET /api/rolls/[rollId]`

- Auth: none
- Path: `rollId`
- Success: `200`
- Errors: `400`, `404`, `500`

### `PATCH /api/rolls/[rollId]`

- Auth: session owner
- Path: `rollId`
- Body: `rollUpdateDto`
- Success: `200`
- Errors: `400`, `401`, `403`, `404`, `500`

### `DELETE /api/rolls/[rollId]`

- Auth: session owner
- Path: `rollId`
- Success: `200`
- Errors: `400`, `401`, `403`, `404`, `500`

### `GET /api/rolls/[rollId]/owner`

- Auth: none
- Path: `rollId`
- Success: `200` with owner id
- Errors: `400`, `404`, `500`

### `GET /api/rolls/[rollId]/photos`

- Auth: none
- Path: `rollId`
- Query: `page`, `limit`
- Success: `200` paginated photos
- Errors: `400`, `404`, `500`

### `POST /api/rolls/[rollId]/photos/[photoId]`

- Auth: session owner
- Path: `rollId`, `photoId`
- Success: `200`
- Side effect: creates `photo-saved` notification for the photo owner when a new roll-photo link is inserted.
- Errors: `400`, `401`, `403`, `404`, `500`

### `DELETE /api/rolls/[rollId]/photos/[photoId]`

- Auth: session owner
- Path: `rollId`, `photoId`
- Success: `200`
- Errors: `400`, `401`, `403`, `404`, `500`

## Users / Profile / Notifications

### `GET /api/users/[id]`

- Auth: session owner
- Path: `id`
- Success: `200`
- Errors: `400`, `401`, `403`, `404`, `500`

### `GET /api/profile/[id]`

- Auth: none
- Path: `id`
- Success: `200`
- Errors: `404`, `500`

### `POST /api/profile/[id]`

- Auth: session owner
- Body: profile update payload
- Success: `200`
- Errors: `401`, `403`, `404`, `500`

### `GET /api/notifications`

- Auth: none (recipient validated by query contract)
- Query: `recipientId`, `page`, `limit`
- Success: `200`
- Errors: `400`, `500`

### `POST /api/notifications`

- Auth: none (validated payload)
- Body: `createNotificationDto`
- Success: `201`
- Errors: `400`, `500`

### `PUT /api/notifications/[id]/read`

- Auth: none (validated id)
- Path: `id`
- Success: `200`
- Errors: `400`, `500`

### `DELETE /api/notifications/[id]/read`

- Auth: none (validated id as user id)
- Path: `id`
- Success: `200`
- Errors: `400`, `500`

## Docs

### `GET /api/openapi`

- Auth: none
- Purpose: serve OpenAPI JSON contract
- Success: `200`
