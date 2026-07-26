# Architecture

## Overview

ParmaConnect is a multi-tenant residential community management platform built with Next.js and PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| App | Next.js 16 (App Router, RSC) |
| Language | TypeScript strict mode |
| Database | PostgreSQL 17 |
| ORM | Prisma 7 with pg adapter |
| Auth | jose (JWT) + bcrypt |
| Validation | Zod |
| Styling | Tailwind CSS v4 |
| Logging | Pino |
| Testing | Vitest + Playwright |
| Container | Docker + Docker Compose |

## Directory Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, register, reset)
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── api/                # API routes
│   │   └── page.tsx            # Landing page
│   ├── lib/                    # Shared server libraries
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── env.ts              # Zod-validated environment
│   │   └── logger.ts           # Pino with redaction
│   ├── config/
│   │   └── community.ts        # Typed community config + defaults
│   └── generated/prisma/       # Prisma-generated types
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Prisma migrations
│   │   └── seed.ts             # Synthetic seed data
│   ├── tests/
│   │   ├── lib/                # Unit tests (Vitest)
│   │   └── e2e/                # E2E tests (Playwright)
│   ├── Dockerfile
│   ├── next.config.ts
│   └── package.json
packages/                       # Future shared packages
modules/                        # Future domain modules
```

## Security Architecture

1. **Tenant isolation**: All queries include communityId filter (enforced at Prisma schema level)
2. **Authorization layers**: Route guard → Service layer → Query filter
3. **Sensitive data**: Masked by default, never logged
4. **Document storage**: Randomized keys, signed URLs with TTL
5. **Audit trail**: Append-only, covers all sensitive operations
6. **Session security**: HTTP-only, SameSite=Lax, short expiry for privileged sessions

## Deployment Options

- **VPS** (primary): Docker Compose + reverse proxy
- **Managed**: Supabase, Railway, Render with PostgreSQL add-on
- **Local**: Docker Compose dev setup

## Future: Monorepo Packages

Planned packages:
- `@parmaconnect/ui` — shared component library
- `@parmaconnect/auth` — auth package
- `@parmaconnect/config` — config package
- `@parmaconnect/validation` — shared Zod schemas

## Key Design Decisions

See DECISIONS.md for architecture decisions and their rationale.