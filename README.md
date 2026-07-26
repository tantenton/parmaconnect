# ParmaConnect

Platform manajemen komunitas terbuka untuk lingkungan perumahan, kampung, cluster, dan komunitas lokal.

**Cluster Parma** adalah instalasi pertama (referensi), bukan satu-satunya.

## Fitur

- Manajemen blok, unit, rumah tangga, dan warga
- Arsip dokumen pribadi (KTP, KK, dll) dengan penyimpanan privat
- Pengumuman dan notifikasi
- Laporan warga dan tugas staf
- Event komunitas
- Kendaraan dan tamu
- Penagihan dan pembayaran
- Audit log untuk aksi sensitif

## Teknologi

- **App**: Next.js 16 + TypeScript (strict) + App Router
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Email/password + secure sessions
- **Styles**: Tailwind CSS v4
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Monitoring**: Pino structured logging

## Mulai Cepat

```bash
# 1. Clone & install
pnpm install

# 2. Setup environment
cp apps/web/.env.example apps/web/.env
# Edit DATABASE_URL

# 3. Database (jika belum ada container)
docker compose -f docker/docker-compose.dev.yml up -d
psql $DATABASE_URL < prisma/migrations/20260725211158_init/migration.sql

# Atau gunakan Prisma migrate (akan memvalidasi & apply):
cd apps/web
npx prisma migrate dev --name init --skip-generate

# 4. Seed data
pnpm db:seed

# 5. Run dev server
pnpm dev
```

Aplikasi tersedia di `http://localhost:3000`.
Health check: `http://localhost:3000/api/health`

## Demo Credentials

```
Admin:    admin@clusterparma.local / DevPassword123!
Residen:  resident1@clusterparma.local / DevPassword123!
```

**PERINGATAN**: Kredensial ini hanya untuk pengembangan lokal. Jangan digunakan di produksi.

## Skrip

```bash
pnpm dev           # Dev server
pnpm build         # Production build
pnpm lint          # ESLint
pnpm typecheck     # TypeScript
pnpm test          # Unit tests (Vitest)
pnpm test:e2e      # E2E tests (Playwright)
pnpm db:seed       # Seed database
pnpm db:studio      # Prisma Studio
pnpm docker:dev    # Start Docker services
pnpm docker:down   # Stop Docker services
```

## Struktur

```
parmaconnect/
├── apps/web/          # Next.js frontend
│   ├── src/app/       # App Router pages
│   ├── src/lib/       # Shared libraries (db, auth, utils)
│   ├── src/config/    # Community configuration
│   └── prisma/        # Schema, migrations, seed
├── packages/          # Shared packages (ui, auth, etc.)
├── modules/           # Domain modules (placeholder)
├── docker/            # Docker Compose files
└── docs/              # Dokumentasi
```

## Lisensi

AGPL-3.0 — lihat LICENSE

## Catatan Keamanan

Jangan commit data resident asli, dokumen keluarga, atau secret production.
Semua data seed adalah fiksi dan jelas ditandai sebagai contoh lokal.