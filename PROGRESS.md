# PROGRESS.md

## Milestone 0 — Repository Foundation
**Status:** ✅ Complete
**Commits:** `5edc0bc`, `08edc0c`

## Milestone 1 — Configuration and Design System
**Status:** ✅ Complete
**Commits:** `e160671`, `40ea85e`

## Milestone 2 — Authentication, Users, Roles, Audit
**Status:** ✅ Complete
**Commits:** `e230c1c`

---

## Milestone 3 — Community, Blocks, Residential Units

**Status:** ✅ Complete

### Commit
- `a2582a9` — feat: Milestone 3 — Community, Blocks, Residential Units (rebased to `b3671b2`)

### Completed Features

**Admin layout** (`/admin`)
- Sidebar navigation with active state highlighting
- Dashboard with summary cards (blocks, units, residents counts)
- Links to all admin sections

**Block CRUD**
- `GET /api/admin/blocks` — List blocks with search, status filter, pagination
- `POST /api/admin/blocks` — Create block (Zod validation, duplicate code check)
- `GET /api/admin/blocks/[id]` — Block detail with unit count
- `PATCH /api/admin/blocks/[id]` — Update name, description, sort order
- Archive guard: blocks with occupied units cannot be archived
- `/admin/blocks` — Table list with badge status, search, filter
- `/admin/blocks/new` — Create form (code → uppercase, name, description, sort order)
- `/admin/blocks/[id]` — Edit form + archive button

**Residential Unit CRUD**
- `GET /api/admin/units` — List units with search, block filter, occupancy filter, pagination
- `POST /api/admin/units` — Create unit (Zod validation, block verification, duplicate unit check)
- `GET /api/admin/units/[id]` — Unit detail with block info + household residents
- `PATCH /api/admin/units/[id]` — Update block, unit number, display name, occupancy/ownership status, notes
- Unit history foundation: unit detail page shows current household/resident state
- `/admin/units` — Table list with filter dropdowns, status badges
- `/admin/units/new` — Create form with block selector, dual status dropdowns
- `/admin/units/[id]` — Edit form + household list at unit

**Search, Filter, Pagination**
- Blocks: search by code/name, filter by status (ACTIVE/INACTIVE/ARCHIVED)
- Units: search by unit number/display name, filter by block, filter by occupancy status
- Pagination controls for both lists
- Server-side filtering with Prisma `contains` (case-insensitive)

**Role Enforcement**
- All admin block/unit APIs check session role (SUPER_ADMIN or ADMIN)
- Non-admin roles receive 403
- Middleware already blocks non-admin from `/admin` routes

**Seed Data**
- Existing seed creates 3 blocks (A, B, C) and 30 units with varied occupancy/ownership statuses
- Synthetic data only — no real resident information

### Functional Verification
- [x] TypeScript passes (tsc --noEmit)
- [x] ESLint passes (0 errors, 0 warnings)
- [x] Vitest passes (23/23 tests)
- [x] Next.js build passes (18 routes)
- [x] Prisma schema validates
- [x] Block API validates duplicates (communityId_code unique)
- [x] Unit API validates duplicates (communityId_unitNumber unique)
- [x] Block archive blocked when occupied units exist
- [x] Invalid input rejected server-side (Zod)
- [x] Search and filter parameters work server-side
- [x] Seed data persists after refresh (idempotent upsert)

### Security Properties
- Block/unit APIs require SUPER_ADMIN or ADMIN role
- Server-side validation for all mutations
- Community scoping enforced (all queries filtered by COMMUNITY_ID)
- Synthetic seed data only

### Known Limitations
- Unit history foundation: shows current households but no change timeline yet
- No bulk import/export for blocks or units
- No unit map or visual block layout

## Milestone 4 — Households and Residents

**Status:** ✅ Complete

### Completed Features
- Centralized household verification transition policy
- Admin household list with search, verification/status filters, pagination
- Household create/detail/deactivate flows with preserved history
- Duplicate active occupancy prevention
- Household head and primary-contact membership validation
- Resident add/update/move-out operations
- Moved-out residents become inactive with move-out timestamp
- Admin verification, revision, rejection, resubmission flows
- Resident self-service own-household page
- Resident family-member creation and verification submission
- Community and household authorization scoping
- Security-officer response redaction
- Audit entries for household/resident changes

### Verification
- [x] TypeScript passes
- [x] ESLint passes (0 errors; 2 non-blocking redaction warnings)
- [x] Vitest passes (43/43)
- [x] Next.js build passes (23 routes)
- [x] Prisma validation/migration status passes
- [x] Authorization and transition tests pass

### Next Milestone
## Milestone 5 — Private Resident Document Archive

**Status:** ✅ Complete
**Commit:** `6939477`
**Push:** ✅ `git push origin main`

### Completed Features
- StorageProvider interface with LocalStorageProvider implementation
- Randomized (Crypto-random) storage keys — non-guessable, original filename excluded from path
- Upload: MIME validation, extension validation, 10MB size limit
- List with filter by document type, status, pagination
- Get metadata with role-based access control
- Verify workflow for doc admins (VERIFIED/REJECTED/NEEDS_REVISION)
- Security officers and finance admins blocked from FAMILY_CARD and IDENTITY_CARD
- Revision request workflow
- Archive with status transition enforcement
- Centralized verification transition policy (DRAFT→SUBMITTED→UNDER_REVIEW→VERIFIED)
- Community-scoped access — resident sees only own household docs
- Audit entries for upload, view, download, verify, revision, archive
- No document content in logs
- No document content in analytics

### Verification
- [x] TypeScript passes
- [x] ESLint passes (0 errors)
- [x] Vitest 43/43 passing
- [x] Next.js build (25 routes)
- [x] Authorization scoping enforced server-side

### Next Milestone
## Milestone 6 — Resident Dashboard and Announcements

**Status:** ✅ Complete

### Completed Features
- Resident dashboard with real database-backed data (community, household, documents, reports, events, contacts)
- Urgent announcement banner (EMERGENCY/URGENT priority)
- Latest announcements with read/unread tracking
- Household verification status and data completion summary
- Document completion and verification status
- Active resident reports count
- Next event display
- Important contacts list
- Quick action links
- Empty states when no data exists

Announcement system:
- Full lifecycle: DRAFT → SCHEDULED → PUBLISHED → EXPIRED → ARCHIVED
- Categories: GENERAL, SECURITY, CLEANLINESS, MAINTENANCE, EVENT, EMERGENCY
- Priorities: LOW, NORMAL, HIGH, URGENT
- Audience targeting: ALL, RESIDENTS, STAFF, SECURITY, FINANCE, ADMINS
- Block-level targeting via targetBlockIds
- Start/expiry date enforcement (scheduled hidden early, expired hidden)
- Read tracking per user (AnnouncementRead model)
- Admin announcement CRUD with publish/unpublish/expire/archive actions
- Admin announcement list with status/category filters and read statistics
- Resident announcement list with category filter
- Resident announcement detail with auto read-marking
- Server-side audience and block targeting enforcement
- Audit entries for all announcement actions

### Verification
- [x] TypeScript passes
- [x] ESLint passes (0 errors, 14 warnings)
- [x] Vitest 71/71 passing (28 new announcement tests)
- [x] Next.js build (27 routes)
- [x] Prisma migration applied (targetBlockIds, attachmentMeta)
- [x] Visibility rules enforced server-side
- [x] Audience restrictions enforced server-side
- [x] Block targeting enforced server-side

### Next Milestone

---

## Milestone 7 — Resident Reports and Staff Tasks

**Status:** ✅ Complete

**Commit:** `a0722ed`

### Completed Features

**Report model & API**
- Report model with categories: SECURITY, WASTE, STREET_LIGHT, DRAINAGE, ROAD, COMMON_FACILITY, NOISE, ANIMAL, OTHER
- Priorities: LOW, MEDIUM, HIGH, URGENT
- Status lifecycle: NEW → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED, plus REJECTED/DUPLICATE
- Centralized transition validation (assertTransition in report-service)
- ReportTimeline model tracks all actions with performer and notes
- API: `GET /api/reports`, `POST /api/reports`, `GET /api/reports/[id]`
- API: `GET /api/admin/reports`, `PATCH /api/admin/reports/[id]` (admin operations)
- Filter by category, status, priority, reporter; pagination

**Staff task assignment**
- assignedStaffId links reports to staff/security officers
- Timeline entries for ASSIGNED, IN_PROGRESS, RESOLVED actions
- Resolution notes and closure tracking (resolvedAt, closedAt timestamps)
- Resident timeline filtering (filterTimelineForResident — hides internal staff notes)

**Admin pages**
- `/admin/reports` — Report list with status/category/priority filters, pagination
- `/admin/reports/[id]` — Report detail with timeline, status transitions, staff assignment

**Resident pages**
- `/resident/reports` — Resident's own reports list
- `/resident/reports/new` — Report creation form
- `/resident/reports/[id]` — Report detail with filtered timeline

### Verification
- [x] TypeScript passes
- [x] ESLint passes
- [x] Vitest 71/71 passing (report transition tests added)
- [x] Next.js build passes
- [x] Prisma migration applied (Report, ReportTimeline models)
- [x] Transition guards enforced server-side
- [x] Resident timeline filtered server-side

---

## Milestone 8 — Events, Contacts, Information Pages, Governance

**Status:** ✅ Complete

**Commit:** `b21fffd`
**Push:** ✅ `git push origin main`

### Completed Features

**Events**
- Event model with lifecycle: DRAFT → ACTIVE → CANCELLED → COMPLETED
- Capacity enforcement (optional; null/0 = unlimited)
- Attendee tracking (EventAttendee model with CONFIRMED/ATTENDED/CANCELLED status)
- Admin CRUD: create, edit, cancel, list with filters
- Resident event list and detail with attendance registration
- API: `GET /api/events`, `POST /api/events`, `GET/PATCH /api/events/[id]`, `POST /api/events/[id]/attend`

**Important Contacts**
- Categories: SECURITY, MANAGEMENT, CLEANING, TECHNICIAN, AMBULANCE, POLICE, FIRE_DEPARTMENT, OTHER
- Visibility levels: PUBLIC, RESIDENTS_ONLY, STAFF_ONLY, ADMIN_ONLY
- Phone normalization (08xxx → 628xxx, strip non-digits)
- Admin CRUD with visibility/category sorting
- Resident contact list (filtered by visibility)
- API: `GET /api/contacts`, `POST /api/admin/contacts`, `GET/PATCH /api/admin/contacts/[id]`

**Information Pages**
- Slug-based routing with content sanitization (XSS prevention)
- Categories, DRAFT/PUBLISHED/ARCHIVED status
- Visibility: PUBLIC, RESIDENTS_ONLY, STAFF_ONLY, ADMIN_ONLY
- Admin CRUD with publisher tracking
- Resident info page listing and detail by slug
- API: `GET /api/info`, `GET /api/info/[slug]`, `POST/PATCH /api/admin/info`, `/api/admin/info/[id]`

**Governance Documents**
- Types: MINUTES, DECISION, POLICY
- Approval workflow: DRAFT → PENDING → APPROVED → REJECTED
- Supersede chain: old record links to new via supersededById, revision number increments
- History preservation (superseded records are not deleted)
- Visibility controls per content
- Admin CRUD with publish/revision management
- Resident governance listing and detail
- API: `GET /api/governance`, `GET/PATCH /api/admin/governance/[id]`, `/api/admin/governance`

**Schema Enhancement**
- Migration `enhance_info_governance` adds InformationPage and GovernanceDocument models
- ContentVisibility enum (PUBLIC, RESIDENTS_ONLY, STAFF_ONLY, ADMIN_ONLY)
- InfoPageStatus, GovernanceType, ApprovalStatus enums

### Verification
- [x] TypeScript passes
- [x] ESLint passes
- [x] Vitest passing (event, contact, info-page, governance tests)
- [x] Next.js build passes
- [x] Prisma migration applied
- [x] Capacity enforcement tested
- [x] Contact visibility enforced server-side
- [x] Info page slug uniqueness enforced
- [x] Governance supersede chain validated

---

## Milestone 9 — Vehicles, Visitors, Packages

**Status:** ✅ Complete

**Commit:** `2bf1c4c`
**Push:** ✅ `git push origin main`

### Completed Features

**Vehicles**
- Vehicle model with types: MOTORCYCLE, CAR, TRUCK, OTHER
- License plate normalization (uppercase, strip whitespace)
- Status: ACTIVE, INACTIVE, EXPIRED, SUSPENDED
- Household and resident association
- Sticker number tracking with validity dates
- Admin CRUD with list/detail views
- Resident vehicle registration and listing
- API: `GET /api/vehicles`, `POST /api/vehicles`, `GET/PATCH /api/vehicles/[id]`
- API: `GET /api/admin/vehicles` (admin list), `POST/PATCH /api/admin/vehicles/[id]`

**Visitors**
- Visitor model with code-based access (8-char uppercase alphanumeric via crypto.randomBytes)
- Status flow: PENDING → APPROVED → ACTIVE → COMPLETED/EXPIRED/REJECTED
- Check-in/check-out tracking with timestamps
- Visit code generation (non-sequential, non-guessable)
- Expiry enforcement (isExpired check)
- Household, license plate, and destination unit tracking
- Admin visitor management with status transitions
- Resident visitor registration and list
- Visitor lookup by code
- API: `GET /api/visitors`, `POST /api/visitors`, `GET/PATCH /api/visitors/[id]`
- API: `GET /api/visitors/lookup` (code-based lookup)

**Packages**
- Package model with status: ARRIVED → NOTIFIED → PICKED_UP (terminal), also RETURNED, EXPIRED
- Status transition validation (assertTransition — no skipping NOTIFIED)
- Recipient name, courier tracking, arrival/pickup timestamps
- Evidence key for package photos
- Household scoping (residents see only own household packages)
- Admin package management with status updates
- Resident package list
- API: `GET /api/packages`, `POST /api/packages`, `GET/PATCH /api/packages/[id]`
- API: `GET /api/admin/packages` (admin list)

**Seed Data**
- Vehicles: 4 sample vehicles across 2 households (2 cars, 2 motorcycles)
- Visitors: PENDING visitor for demo household
- Packages: 3 packages (ARRIVED, NOTIFIED, PICKED_UP) for demo household

### Verification
- [x] TypeScript passes
- [x] ESLint passes
- [x] Vitest 121/121 passing (vehicle, visitor, package tests)
- [x] Next.js build passes
- [x] Prisma migration applied
- [x] Visit code uniqueness verified
- [x] Package status transitions enforced
- [x] Household scoping enforced for packages
- [x] License plate normalization tested
- [x] Visitor expiry validated

---

## Project Summary

| Milestone | Status | Commit | Tests |
|-----------|--------|--------|-------|
| M0 — Repository Foundation | ✅ | `5edc0bc` | — |
| M1 — Config & Design System | ✅ | `e160671` | — |
| M2 — Auth, Users, Roles, Audit | ✅ | `e230c1c` | 17 |
| M3 — Blocks & Residential Units | ✅ | `b3671b2` | 23 |
| M4 — Households & Residents | ✅ | `1b41c73` | 43 |
| M5 — Private Resident Documents | ✅ | `6939477` | 43 |
| M6 — Resident Dashboard & Announcements | ✅ | `abf5acb` | 71 |
| M7 — Reports & Staff Tasks | ✅ | `a0722ed` | 71 |
| M8 — Events, Contacts, Info Pages, Governance | ✅ | `b21fffd` | 105+ |
| M9 — Vehicles, Visitors, Packages | ✅ | `2bf1c4c` | 121 |

**Overall:** 10/10 milestones complete. 121 tests passing. Build clean. Ready for audit.
