# Entity Relationship Diagram (ERD)

Updated: 2026-05-17

## Scope
This ERD reflects the PostgreSQL + Drizzle model as the canonical and only
supported persistence architecture.

Primary sources:
- `packages/db/schemas/*.ts`
- `packages/db/queries/*.ts`
- `apps/web/src/backend/dtos/*.ts`

## Naming Convention
This diagram uses physical PostgreSQL column names, so fields are shown in
`snake_case`. Application code, DTOs, frontend props, and API contracts use
`camelCase` for the corresponding values.

Example mapping:

| Application field | Database column |
| --- | --- |
| `userId` | `user_id` |
| `photoId` | `photo_id` |
| `avatarUrl` | `avatar_url` |
| `createdAt` | `created_at` |

## Canonical Relational ERD
```mermaid
erDiagram
    USERS {
      uuid user_id PK
      text username UK
      text email UK
      text password
      text avatar_url
      user_role role
      boolean verified
      timestamptz password_changed_at
      timestamptz created_at
      timestamptz updated_at
    }

    PHOTOS {
      uuid photo_id PK
      uuid user_id FK
      text url
      text title
      text description
      text category
      text style
      text color
      text camera
      timestamptz created_at
      timestamptz updated_at
    }

    PHOTO_METADATA {
      uuid photo_metadata_id PK,FK
      integer width
      integer height
      text format
      integer size
      timestamptz uploaded_at
    }

    BOOKMARKS {
      uuid bookmark_id PK
      uuid photo_id FK
      uuid user_id FK
      timestamptz created_at
      timestamptz updated_at
    }

    COMMENTS {
      uuid comment_id PK
      uuid photo_id FK
      uuid user_id FK
      text text
      timestamptz created_at
      timestamptz updated_at
    }

    ROLLS {
      uuid roll_id PK
      uuid user_id FK
      text name
      text description
      text image_url
      timestamptz created_at
      timestamptz updated_at
    }

    ROLL_PHOTOS {
      uuid roll_id PK,FK
      uuid photo_id PK,FK
    }

    CONTACTS {
      uuid contact_id PK
      text name
      text email
      text subject
      text message
      text ip_address
      text user_agent
      contact_status status
      timestamptz responded_at
      timestamptz created_at
      timestamptz updated_at
    }

    BUG_REPORTS {
      uuid bug_report_id PK
      text title
      text email
      text description
      text steps
      text expected_behavior
      text actual_behavior
      text browser
      text attachments
      bug_severity severity
      bug_status status
      text ip_address
      text user_agent
      timestamptz created_at
      timestamptz updated_at
    }

    NEXT_AUTH_USERS {
      uuid id PK
      text name
      text email UK
      timestamptz emailVerified
      text image
    }

    NEXT_AUTH_SESSIONS {
      uuid id PK
      timestamptz expires
      text sessionToken UK
      uuid userId FK
    }

    NEXT_AUTH_ACCOUNTS {
      uuid id PK
      text type
      text provider
      text providerAccountId
      uuid userId FK
    }

    NEXT_AUTH_VERIFICATION_TOKENS {
      text token PK
      text identifier
      timestamptz expires
    }

    USERS ||--o{ PHOTOS : owns
    PHOTOS ||--|| PHOTO_METADATA : has
    USERS ||--o{ BOOKMARKS : saves
    PHOTOS ||--o{ BOOKMARKS : saved_by
    USERS ||--o{ COMMENTS : writes
    PHOTOS ||--o{ COMMENTS : receives
    USERS ||--o{ ROLLS : owns
    ROLLS ||--o{ ROLL_PHOTOS : contains
    PHOTOS ||--o{ ROLL_PHOTOS : appears_in
    NEXT_AUTH_USERS ||--o{ NEXT_AUTH_SESSIONS : has
    NEXT_AUTH_USERS ||--o{ NEXT_AUTH_ACCOUNTS : links
```

## Data Policy
- PostgreSQL is the only supported data persistence layer.
- Any non-PostgreSQL persistence layer is out of scope and should not be
  introduced in new work.
- Terminology is standardized as `bookmarks` only.
