# KNOWN_ISSUES.md

## Active Issues

### Issue 1: No GitHub Push Credentials
**Status**: Open
**Impact**: Changes committed locally cannot be pushed to GitHub.
**Workaround**: Set GH_TOKEN env var or configure SSH key for GitHub.
**Next step**: Configure GH_TOKEN or SSH key, then `git push origin main`.

### Issue 2: Migrations Not Applied
**Status**: Resolved ✓
**Impact**: N/A
**Resolution**: Migrations verified in sync — `npx prisma migrate dev` confirmed "Already in sync, no schema change or pending migration".

### Issue 3: Seed Not Verified
**Status**: Resolved ✓
**Impact**: N/A
**Resolution**: Seed runs successfully — 15 households, 16 users, 15 residents, announcements, events, contacts, vehicles, billing, invoices, reports, visitors seeded. Bugfix applied: changed `resident.create` to `resident.upsert` with deterministic IDs for idempotency.

### Issue 4: No CI/CD for Deployment
**Status**: Open
**Impact**: CI workflow exists but no CD pipeline.
**Workaround**: Manual deployment.
**Next step**: Add deployment workflow when environment is available.

### Issue 5: Limited Test Coverage
**Status**: Open
**Impact**: Only utility functions have unit tests. No auth/authz/domain tests yet.
**Workaround**: Manual verification during development.
**Next step**: Add tests in each milestone.

### Issue 6: No GitHub Secrets for CI
**Status**: Open
**Impact**: CI workflow cannot access production or staging environments.
**Workaround**: CI only verifies build/test/lint.
**Next step**: Configure secrets when GitHub remote is available.

## Resolved Issues
- Issue 2 — Migrations Not Applied: ✅ Resolved
- Issue 3 — Seed Not Verified: ✅ Resolved (bugfix applied)