# Contributing to ParmaConnect

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Copy env file: `cp apps/web/.env.example apps/web/.env`
4. Start PostgreSQL: `docker compose -f docker/docker-compose.dev.yml up -d`
5. Run migrations: `pnpm db:migrate`
6. Seed data: `pnpm db:seed`
7. Start dev server: `pnpm dev`

## Workflow

1. Create a branch: `git checkout -b feat/your-feature`
2. Write tests first (see TDD guidelines below)
3. Implement feature
4. Run checks: `pnpm typecheck && pnpm lint && pnpm test`
5. Commit with conventional format (see below)
6. Push and create a PR

## Commit Format

```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `security`

Example:
```
feat(auth): add role-based access control for document admins
```

## Testing

Run unit tests: `pnpm test`
Run e2e tests: `pnpm test:e2e`
Run typecheck: `pnpm typecheck`
Run lint: `pnpm lint`

## Security

- Never commit real resident data or identity documents
- Never commit secrets or production credentials
- All new auth/authz features require security tests
- Run `pnpm security:check` before submitting

## Code Style

- TypeScript strict mode enforced
- ESLint + Prettier configured
- Prefer explicit types over `any`
- Small, focused functions
- Clear naming in Indonesian + English

## Questions

Open an issue for bugs, feature requests, or questions.