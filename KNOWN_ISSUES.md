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
**Impact**: 121 tests covering all domains. Integration and e2e coverage not yet implemented.
**Workaround**: Unit tests cover core business logic (transitions, validation, auth).
**Next step**: Add Playwright e2e tests for critical user flows.

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

### Issue 9: Holver Provider Not Suitable for Delegation
**Status**: Open
**Impact**: Holver truncates subagent output, causing incomplete multi-file operations.
**Workaround**: Use 9router provider for delegation tasks.
**Next step**: Fix or replace Holver provider for subagent use cases.

### Issue 10: Package Audit Uses VEHICLE Entity Type
**Status**: Open
**Impact**: Package audit events logged as entityType "VEHICLE" because AuditEntityType missing PACKAGE.
**Workaround**: None — audit logs for packages are mis-categorized.
**Next step**: Add PACKAGE to AuditEntityType union and update package service audit calls.

### Issue 11: Some UI Pages May Need Pagination for Large Datasets
**Status**: Open
**Impact**: Admin list pages for contacts, governance, info pages, packages, vehicles, and visitors may become slow or unusable with large datasets.
**Workaround**: Current implementations return all records (no server-side pagination for these specific lists).
**Next step**: Add server-side pagination to remaining admin list API endpoints.

### Issue 12: ESLint Warnings (18) from Unused Vars
**Status**: Open
**Impact**: 18 ESLint warnings from unused variables in generated code and some page components.
**Workaround**: Build passes (warnings, not errors). No runtime impact.
**Next step**: Clean up unused imports and variables, or add eslint-disable comments for generated files.

## Resolved Issues
- Issue 1 — No GitHub Push Credentials: ✅ Resolved (SSH configured)
- Issue 2 — Migrations Not Applied: ✅ Resolved
- Issue 3 — Seed Not Verified: ✅ Resolved (bugfixes applied)
- All seed resources idempotent: ✅ upsert used for Community, Blocks, Units, Users, Households, Residents, Vehicles, Visitors, Packages
