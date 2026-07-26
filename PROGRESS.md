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

### Next Milestone
## Milestone 4 — Households and Residents
