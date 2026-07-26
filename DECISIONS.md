# DECISIONS.md

## Architecture Decisions

### AD-001: Technology Stack
**Decision**: Next.js 16 + TypeScript strict + App Router + PostgreSQL + Prisma 7
**Rationale**: Modern, well-supported stack. Prisma 7 provides type safety across the entire data layer. App Router enables React Server Components for performance. PostgreSQL is production-grade with Prisma's pg adapter.
**Status**: Accepted

### AD-002: Multi-Tenant Design
**Decision**: Every entity has a communityId (tenant root). All queries scope to communityId.
**Rationale**: Enables future multi-community hosting. Isolates data per installation. Cross-community access is architecturally impossible at the schema level.
**Status**: Accepted

### AD-003: Sensitive Identity Separation
**Decision**: ResidentSensitiveIdentity is a separate Prisma model, linked 1:1 to Resident. Never returned by ordinary list endpoints.
**Rationale**: NIK and family card numbers are highly sensitive. Separation ensures they can't accidentally leak through a forgotten select/include in a normal query.
**Status**: Accepted

### AD-004: Document Storage
**Decision**: Documents stored with randomized storageKeys (cuid). Access via time-limited signed URLs.
**Rationale**: Random keys prevent enumeration attacks. Signed URLs allow controlled access without permanent public URLs.
**Status**: Accepted

### AD-005: Logging
**Decision**: Pino structured logging with redaction paths for sensitive fields.
**Rationale**: Structured logs are parseable. Redaction prevents accidental logging of NIK, family card, passwords, tokens.
**Status**: Accepted

### AD-006: Environment Validation
**Decision**: Zod-validated environment variables at startup. Application fails fast on invalid env.
**Rationale**: Prevents runtime errors from misconfigured environments. Typed env schema is self-documenting.
**Status**: Accepted

### AD-007: Community Configuration
**Decision**: Typed community config system with Cluster Parma as default. Config validated by Zod.
**Rationale**: Community name, terminology, module flags are configurable without modifying core source. Supports future multi-installation.
**Status**: Accepted

### AD-008: Authentication
**Decision**: Email/password with bcrypt hashing, jose JWT for sessions, HTTP-only cookies.
**Rationale**: Secure, well-understood, no external auth provider dependency for the core flow. Supports MFA for privileged admins via documented capability.
**Status**: Accepted

### AD-009: Testing Strategy
**Decision**: Vitest for unit tests, Playwright for e2e tests.
**Rationale**: Vitest is fast, integrates with Vite/Next.js ecosystem. Playwright provides reliable cross-browser e2e.
**Status**: Accepted

### AD-010: Module Flags
**Decision**: Module flags control which features are visible. Security controls are always-on (not disableable).
**Rationale**: Allows communities to opt out of features without forking code. Security cannot be casually disabled.
**Status**: Accepted

### AD-011: Block and Unit Archive Safety
**Decision**: Blocks with occupied units cannot be archived. API checks unit occupancy before allowing archive.
**Rationale**: Prevents accidental data loss. Blocks can only be archived when all units are vacant/unconfirmed.
**Status**: Accepted