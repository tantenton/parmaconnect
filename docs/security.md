# Security Guide

## Authentication

### Password Policy
- Minimum 8 characters (enforced at Zod validation)
- bcrypt hash with cost factor 12
- No password in logs or error messages

### Session Management
- JWT signed with HS256 (jose library)
- Access token in HTTP-only cookie
- SameSite=Lax (strict in production)
- Secure flag in production (HTTPS)
- Privileged sessions (ADMIN and above): shorter expiry

### Login Security
- Rate limiting on login endpoint
- Account lockout after repeated failures (configurable threshold)
- Disabled accounts cannot authenticate
- Session revocation on logout

## Authorization

### Role Hierarchy
```
SUPER_ADMIN → ADMIN → DOCUMENT_ADMIN → FINANCE_ADMIN → SECURITY_OFFICER → STAFF → RESIDENT
```

### Authorization Layers
1. **Route guard**: Check session + role before rendering protected pages
2. **Service layer**: Validate caller has permission for the operation
3. **Query filter**: Always include communityId in Prisma queries

### IDOR Prevention
- All resource IDs are scoped to communityId
- Residents can only query resources where their householdId matches
- Security officers see operational fields only (not family documents)
- Finance admins see billing data only (not family documents)

### Cross-Household Access Tests
See `tests/security/authorization.test.ts` for automated regression tests proving:
- Resident A cannot access resident B's data
- Security officer cannot access family card documents
- Finance admin cannot access family card documents
- Anonymous users cannot access protected routes

## Sensitive Data Handling

### Masking
- NIK: `3273••••••••1234` (first 4 + last 4 visible)
- Family card: `3273••••••••5678` (first 4 + last 4 visible)
- Full values never sent to client in list endpoints

### Logging
S pino redaction removes: password, passwordHash, token, sessionToken, nik, encryptedNik, familyCardNumber, encryptedFamilyCardNumber, authorization, cookie, secret, apiKey, privateKey

### Document Storage
- Storage keys are random (cuid-based), not predictable
- Documents never use public permanent URLs
- Access via time-limited signed URLs (default 300s TTL)
- All document downloads are logged in AuditLog

## Input Validation

- Zod schemas for all API inputs
- Server-side validation is mandatory
- Client-side validation is a convenience layer only
- File uploads: type check + size limit + magic byte verification

## Security Headers

Implemented via Next.js headers config (security-headers.ts):
- Content-Security-Policy
- HSTS (production only)
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- X-Frame-Options: DENY
- Permissions-Policy (disabled features)

## Dependency Security

```bash
pnpm security:check   # npm audit with audit-level=high
```

Run in CI on every PR. Block merges on high/critical vulnerabilities.

## Secret Management

All secrets come from environment variables. No secrets in:
- Source code
- Configuration files
- Git history
- Docker images (use build args or secrets)

## Audit Logging

All sensitive actions are recorded:
- Login / logout
- Failed privileged login
- Role changes
- Household/Resident verification
- Document view/download
- Billing changes
- Payment processing
- Admin account changes

Audit entries are append-only from application workflows.