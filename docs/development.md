# Development Guide

## Prerequisites

- Node.js >= 22
- pnpm >= 8
- PostgreSQL 17 (or Docker)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp apps/web/.env.example apps/web/.env
# Edit .env: set DATABASE_URL to your PostgreSQL instance

# 3. Start PostgreSQL (if using Docker)
docker compose -f docker/docker-compose.dev.yml up -d

# 4. Run migrations
cd apps/web
npx prisma migrate dev --name init --skip-generate

# 5. Seed data
pnpm db:seed

# 6. Start dev server
pnpm dev
```

## Database Commands

```bash
pnpm db:generate    # Regenerate Prisma client
pnpm db:migrate     # Apply migrations
pnpm db:push        # Push schema (dev only, no migrations)
pnpm db:studio      # Open Prisma Studio
pnpm db:seed        # Run seed script
```

## Running Tests

```bash
pnpm test           # Unit tests (Vitest)
pnpm test:e2e       # E2E tests (Playwright, requires dev server)
pnpm test --watch   # Watch mode
pnpm typecheck      # TypeScript check
pnpm lint           # ESLint
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | — | PostgreSQL connection string |
| SESSION_SECRET | Yes | — | Min 32 chars, for JWT signing |
| APP_URL | No | http://localhost:3000 | Application URL |
| STORAGE_PROVIDER | No | local | local or s3 |
| PAYMENT_PROVIDER | No | mock | mock, manual, midtrans, xendit |
| LOG_LEVEL | No | info | pino log level |

## Code Generation

Prisma client is generated to `src/generated/prisma/`. After schema changes:

```bash
cd apps/web
npx prisma generate
```

## Adding a Migration

```bash
cd apps/web
npx prisma migrate dev --name describe_change
```

## Adding a Domain Module

Create under `modules/<name>/` following the structure:
- `services/` — business logic
- `routes/` — API routes
- `components/` — UI components
- `test/` — tests

## Debugging

Enable Prisma query logging in development by setting `log: ["query"]` in `src/lib/db.ts` temporarily.

## Production Build

```bash
pnpm build
pnpm start
```