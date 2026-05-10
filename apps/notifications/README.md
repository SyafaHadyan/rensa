# Rensa Elysia Microservice

## Getting Started

Install dependencies:

```bash
bun install
```

Create an environment file with:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rensa
NEXTAUTH_SECRET=your-secret
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
PORT=3002
```

## Database

This service uses PostgreSQL through Drizzle ORM.
The database schema only stores notification data. User IDs are stored as text
references to the user service owned by `rensa-frontend`; this service does not
own or migrate a `users` table.
Pending migrations are applied automatically when the service starts.

```bash
bun run db:generate
bun run db:migrate
```

## Development

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3002/health to check the service.

## Structure

- `src/config` - environment configuration
- `src/database` - Drizzle client and PostgreSQL schema
- `src/modules/*` - MVC-style feature modules with controllers, services, repositories, and models
- `src/utils` - shared infrastructure clients
