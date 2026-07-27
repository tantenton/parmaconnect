# PROGRESS.md

## Milestone 0 — Repository Foundation
**Status:** ✅ Complete
**Commits:** `5edc0bc`, `08ed0c0`

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
- `a2582a9` — feat: Milestone 3 — Community, Blocks, Residential Units

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
## Milestone 7 — Resident Reports and Staff Tasks
