# KNOWN_ISSUES.md

## Active Issues

### Issue 1: No GitHub Push Credentials
**Status**: Resolved ✓
**Resolution**: SSH key configured, remote set to `git@github.com:tantenton/parmaconnect.git`. Push working.

### Issue 2: Migrations Not Applied
**Status**: Resolved ✓
**Impact**: N/A
**Resolution**: Migrations verified in sync — `npx prisma migrate dev` confirmed "Already in sync".

### Issue 3: Seed Not Verified
**Status**: Resolved ✓
**Impact**: N/A
**Resolution**: Seed runs idempotently. Bugfixes applied: `resident.create` → `resident.upsert`, `visitor.create` → `visitor.upsert`. Demo accounts for all 7 roles added.

### Issue 4: No CI/CD for Deployment
**Status**: Open
**Impact**: CI workflow exists but no CD pipeline.
**Workaround**: Manual deployment.
**Next step**: Add deployment workflow when environment is available.

### Issue 5: Limited Test Coverage
**Status**: Open — improving
**Impact**: Auth tests (17) and utils tests (6) written. No domain CRUD tests yet.
**Workaround**: Manual verification during development.
**Next step**: Add domain tests in each milestone.

### Issue 6: No GitHub Secrets for CI
**Status**: Open
**Impact**: CI workflow cannot access production or staging environments.
**Workaround**: CI only verifies build/test/lint.
**Next step**: Configure secrets when production environment is available.

### Issue 7: Middleware Deprecated in Next.js 16
**Status**: Open
**Impact**: Build passes but with deprecation warning. `middleware.ts` should be migrated to `proxy` pattern.
**Workaround**: Current middleware works but logged as deprecated.
**Next step**: Migrate to proxy when available in Next.js 16 stable.

### Issue 8: No Password Reset Email Flow
**Status**: Open
**Impact**: PasswordResetToken model exists but no email sending implemented.
**Workaround**: Manual password reset via DB for now.
**Next step**: Implement email service and password reset UI.

## Resolved Issues
- Issue 1 — No GitHub Push Credentials: ✅ Resolved (SSH configured)
- Issue 2 — Migrations Not Applied: ✅ Resolved
- Issue 3 — Seed Not Verified: ✅ Resolved (bugfixes applied)
- All seed resources idempotent: ✅ upsert used for Community, Blocks, Units, Users, Households, Residents, Vehicles, Visitors
