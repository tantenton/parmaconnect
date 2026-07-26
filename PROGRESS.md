# PROGRESS.md

## Milestone 0 — Repository Foundation

### Status: ✅ Complete

### Completed Features
- Next.js 16 App Router project scaffolded
- TypeScript strict mode enabled
- Prisma 7 schema with all domain models (35+ models)
- PostgreSQL database adapter (PrismaPg + pg Pool)
- Environment validation with Zod (typed env)
- Pino structured logging with redaction
- Community configuration system (typed, Cluster Parma defaults)
- Module flags system
- Utilities (formatCurrency, maskSensitive, normalizeLicensePlate, cn)
- Vitest unit tests (6 tests passing)
- Playwright e2e test foundation
- Health endpoint (/api/health)
- Docker Compose dev + prod configurations
- Dockerfile (standalone build)
- CI workflow (GitHub Actions)
- Prisma seed script (synthetic Cluster Parma data)
- Root documentation: README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, LICENSE, CHANGELOG
- docs/: architecture, development, deployment-vps, security, data-model, roadmap

### Commits
- `5edc0bc` — feat: initial scaffold
- `08ed0c0` — docs: update PROGRESS.md and KNOWN_ISSUES.md

### Push Status
- Remote: git@github.com:tantenton/parmaconnect.git
- Pushed: ✅ `git push origin main` — pushed

---

## Milestone 1 — Configuration and Design System

### Status: ✅ Complete

### Completed Features
- DB-backed community config service (`src/lib/config.ts`)
- ConfigProvider React context + `useCommunityConfig()` hook
- i18n foundation with next-intl (id-ID primary, en fallback)
- Messages: id.json (Indonesian), en.json (English)
- UI components: Button, Card, Input, Badge, Skeleton
- Landing page updated with i18n + config context + new components
- Root layout wrapped with NextIntlClientProvider + ConfigProvider
- next-intl plugin configured in next.config.ts

### Commits
- `e160671` — feat: Milestone 1 — Config system, i18n, UI components

---

## Milestone 2 — Authentication, Users, Roles, Audit

### Status: ✅ Complete

### Completed Features
- **Auth service** (`src/lib/auth/auth-service.ts`)
  - `hashPassword` / `verifyPassword` — bcrypt (12 rounds)
  - `createSession` / `verifySessionToken` — jose JWT (HS256)
  - `login` / `logout` / `register` — full auth flow
  - `revokeSession` / `revokeAllUserSessions` — session management
  - `setSessionCookie` / `clearSessionCookie` — HTTP-only secure cookies
  - Privileged sessions (4h expiry for SUPER_ADMIN/ADMIN)
  - Failed login attempt tracking (audit)

- **Permissions system** (`src/lib/auth/permissions.ts`)
  - Role hierarchy: SUPER_ADMIN(100), ADMIN(80), DOCUMENT_ADMIN(60), FINANCE_ADMIN(60), SECURITY_OFFICER(50), STAFF(40), RESIDENT(10)
  - `hasMinRank`, `hasPermission`, `canManageRole`, `requireRole`
  - 25+ granular permission definitions across all domains
  - Role management rules (who can assign which roles)

- **Auth middleware** (`src/middleware.ts`)
  - JWT-based session validation on every request
  - Public routes bypass auth (health, login, register)
  - Admin routes protected (403 for non-admin)
  - API routes return JSON 401/403, pages redirect to login

- **Auth API routes**
  - `POST /api/auth/login` — authenticate, set cookie, audit log
  - `POST /api/auth/logout` — revoke session, clear cookie
  - `POST /api/auth/register` — create RESIDENT account
  - `GET /api/auth/login` — session check endpoint
  - `GET/PATCH/DELETE /api/auth/users` — admin user management
  - `GET /api/audit` — audit log retrieval (admin only)

- **Auth pages**
  - `/auth/login` — login form with error handling, role-based redirect
  - `/auth/register` — registration form with validation

- **Audit log service** (`src/lib/auth/audit.ts`)
  - 23 typed audit actions (LOGIN, LOGIN_FAILED, ROLE_CHANGE, ACCOUNT_DISABLE, SESSION_REVOKE, etc.)
  - 11 typed entity types
  - Append-only, never crashes the app
  - Auto-redaction via Pino logger
  - `getAuditLogs` with filtering (action, userId, entityType, date range)

- **Seed demo accounts** (all passwords: `DevPassword123!`)
  - `superadmin@clusterparma.local` — SUPER_ADMIN
  - `admin@clusterparma.local` — ADMIN
  - `docadmin@clusterparma.local` — DOCUMENT_ADMIN
  - `finance@clusterparma.local` — FINANCE_ADMIN
  - `security@clusterparma.local` — SECURITY_OFFICER
  - `staff@clusterparma.local` — STAFF
  - `resident1..15@clusterparma.local` — RESIDENT

- **Auth tests** (`tests/auth/auth.test.ts` — 17 tests)
  - Password hashing and verification
  - Invalid/expired JWT rejection
  - Seed user existence for all roles
  - Role hierarchy and permission checks
  - Admin vs resident authorization
  - Route protection (unauthenticated, unauthorized)

### Functional Verification
- [x] TypeScript passes (tsc --noEmit)
- [x] ESLint passes (0 errors, 0 warnings)
- [x] Vitest passes (23 tests: 17 auth + 6 utils)
- [x] Next.js build passes (11 routes)
- [x] Prisma schema validates
- [x] Seed runs idempotently (all roles created)
- [x] All 7 initial roles defined with correct hierarchy
- [x] Audit log model supports all required actions
- [x] Admin user management (list, update role, disable, delete)
- [x] No real secret, token, or resident data in codebase

### Known Limitations
- Middleware uses deprecated Edge Runtime pattern in Next.js 16 (build still passes)
- No password reset email flow yet (foundation exists with PasswordResetToken model)
- No MFA implementation (documented capability)
- E2E tests need dev server running (not yet automated)

### Security Properties
- Passwords hashed with bcrypt (12 rounds)
- JWT signed with HS256 using 32+ char secret
- HTTP-only, secure, sameSite=lax cookies
- Session expiry enforced (7 days regular, 4h privileged)
- Admin routes reject non-admin roles server-side
- Audit trail created for: login, failed login, role changes, account disable, session revoke
- Client-side role manipulation ignored (server always re-verifies)
- Role changes take effect after session refresh/revocation
- Disabled users cannot authenticate
- Residents cannot access admin/admin API routes
- Super Admin cannot be deleted through the API

### Commits
- `2828ec8` — feat: Milestone 2 — Auth, Users, Roles, Audit
- `40ea85e` — docs: record push status in PROGRESS.md

---

## Next Milestone — Milestone 3: Resident Dashboard & Reports

### Status: Pending

Goals:
1. Resident dashboard page (/dashboard) with role-appropriate content
2. Report creation, listing, and tracking
3. Report timeline (status updates)
4. Announcements view
5. Event view
6. Profile page
7. Tests for resident-facing features
