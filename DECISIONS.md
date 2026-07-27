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

### AD-012: Announcement Visibility Model
**Decision**: Announcements use audience (role-based targeting) + block-level targeting (targetBlockIds). Both are enforced server-side.
**Rationale**: Allows granular message delivery — e.g., emergency to all residents, maintenance to specific blocks. Dual enforcement prevents both over-broad and under-broad delivery.
**Status**: Accepted

### AD-013: Report Transition Policy
**Decision**: Centralized assertTransition function validates all report status changes. Transitions: NEW→VERIFIED→ASSIGNED→IN_PROGRESS→RESOLVED→CLOSED, plus REJECTED/DUPLICATE from NEW. CLOSED/RESOLVED can reopen to IN_PROGRESS.
**Rationale**: Single source of truth for valid transitions prevents inconsistent state. Reopen support allows corrections after premature closure.
**Status**: Accepted

### AD-014: Schema Enhancement for InformationPage/GovernanceDocument
**Decision**: Migration `enhance_info_governance` adds InformationPage (slug-based, categorized, visible) and GovernanceDocument (supersede chain, revision tracking, approval workflow) models.
**Rationale**: Information pages and governance documents have distinct lifecycle needs. Supersede chain preserves document history while allowing updates. Approval workflow prevents unauthorized publication.
**Status**: Accepted

### AD-015: Delegation Provider — 9router over Holver
**Decision**: Subagent delegation uses 9router provider, not Holver.
**Rationale**: Holver truncates subagent output, breaking multi-file operations. 9router returns full output without truncation.
**Status**: Accepted

### AD-016: AuditEntityType Expansion
**Decision**: CONTACT, INFO_PAGE, GOVERNANCE added to AuditEntityType union. PACKAGE not yet added (see KNOWN_ISSUES).
**Rationale**: Covers M8 entity types for audit trail. PACKAGE deferred due to scope cut — package audit currently uses VEHICLE type as fallback.
**Status**: Accepted (with known gap)

### AD-017: Visitor Code Generation
**Decision**: Visit codes generated via crypto.randomBytes, producing 8-char uppercase alphanumeric strings. Non-sequential, non-guessable.
**Rationale**: Security gates need unpredictable codes to prevent enumeration or forged entry. Sequential codes would be trivially guessable.
**Status**: Accepted

### AD-018: Package Status Flow
**Decision**: Package status flow: ARRIVED → NOTIFIED → PICKED_UP (terminal). RETURNED and EXPIRED reachable from ARRIVED or NOTIFIED. Direct ARRIVED→PICKED_UP forbidden.
**Rationale**: Residents must be notified before pickup — this is a security/safety requirement. Skipping notification would cause missed packages.
**Status**: Accepted