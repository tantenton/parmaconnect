# Security Policy

## Supported Versions

| Version | Supported          |
| ------- |-------------------|
| 0.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately:

1. **Do NOT** create a public GitHub issue
2. Email: admin@clusterparma.local ( ganti untuk instalasi Anda)
3. Include: description, steps to reproduce, potential impact
4. Expect response within 48 hours
5. Expect a fix timeline based on severity

## Security Principles

- All database access goes through Prisma ORM with typed queries
- Authorization checks at route, service, and query level
- Sensitive fields (NIK, family card) are masked by default
- Documents stored with randomized keys, no public URLs
- Audit log for all sensitive operations
- HTTP-only, SameSite cookies for sessions
- Rate limiting on auth endpoints
- Input validation on both client and server (Zod)

## Sensitive Data

- Never log NIK, family card numbers, or full identity details
- Never store documents in public directories
- Never expose service-role credentials to the client
- Never use real resident data in development or tests

## Authentication

- Passwords hashed with bcrypt (cost factor 12)
- Sessions use signed JWT (jose)
- Session tokens are single-use on revocation
- Disabled accounts cannot authenticate

## Authorization Model

Roles: SUPER_ADMIN > ADMIN > DOCUMENT_ADMIN > FINANCE_ADMIN > SECURITY_OFFICER > STAFF > RESIDENT

Granular permissions checked at every sensitive operation:
- Residents see only their own household
- Security officers see operational data, not family documents
- Document admins can review documents, not financial data
- Finance admins see billing, not private documents

## Dependencies

Run security audit:
```bash
pnpm security:check
```

Keep dependencies updated. ParmaConnect uses `pnpm` for deterministic installs.