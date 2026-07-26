# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2026-07-26

### Added
- Repository foundation with Next.js 16, TypeScript strict mode, App Router
- Complete Prisma schema with all domain models (Community, Blocks, Units, Households, Residents, Documents, Announcements, Reports, Events, Contacts, Vehicles, Billing, Payments, Notifications, Audit, Visitors, Packages, Security Events, CCTV)
- PostgreSQL database with Prisma ORM adapter
- Environment validation with Zod (typed env schema)
- Pino structured logging with sensitive-data redaction
- Community configuration system (typed, Cluster Parma defaults)
- Module flags for optional features (billing, visitors, CCTV, etc.)
- Docker Compose dev + prod setup
- CI workflow (GitHub Actions)
- Unit tests (Vitest) + E2E test foundation (Playwright)
- Prisma seed script with synthetic Cluster Parma data
- Health endpoint (/api/health)
- Indonesian translations as default locale

### Security
- Sensitive field masking utilities
- Logger redaction for NIK, family card, passwords, tokens
- No production secrets committed