# KNOWN_ISSUES.md

## Active Issues

### Issue 1: No Git Remote
**Status**: Open
**Impact**: Changes cannot be pushed to GitHub.
**Workaround**: Work locally, push when remote is configured.
**Next step**: Configure remote after initial commit.

### Issue 2: Migrations Not Applied
**Status**: Open
**Impact**: Database schema exists in Prisma schema but not in live PostgreSQL.
**Workaround**: Run `npx prisma migrate dev` manually.
**Next step**: Apply migrations during development.

### Issue 3: Seed Not Verified
**Status**: Open
**Impact**: Seed script has been written but not run against live database.
**Workaround**: Run `pnpm db:seed` manually.
**Next step**: Verify seed during development.

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

None yet.