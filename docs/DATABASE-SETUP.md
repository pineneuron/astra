# Using a Different Database (New Project)

This project uses **Prisma** with **PostgreSQL**. To point the copied project at a new database:

## 1. Create a new PostgreSQL database

Choose one:

- **Local**: Install PostgreSQL and create a database, or use Docker:
  ```bash
  docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=astra_dev postgres:16
  ```
- **Neon**: https://neon.tech → create project → copy connection string
- **Supabase**: https://supabase.com → create project → Settings → Database → connection string
- **Railway / Render / Vercel Postgres**: Create a Postgres service and copy the URL

## 2. Update environment variables

Edit **`.env`** and **`.env.local`** and set:

```env
# Required – Prisma uses this (see prisma/schema.prisma)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME?sslmode=require"
```

Examples:

- **Local (no SSL)**:
  ```env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/astra_dev"
  ```
- **Neon / Supabase (with SSL)**:
  ```env
  DATABASE_URL="postgresql://user:pass@host.region.aws.neon.tech/neondb?sslmode=require"
  ```

If you are **not** using Prisma Data Platform / Accelerate, you can leave these empty or remove them:

```env
POSTGRES_URL=""
PRISMA_DATABASE_URL=""
```

## 3. Apply schema and (optional) seed

From the project root:

```bash
# Create tables in the new database
npx prisma db push

# Optional: generate Prisma Client (after schema changes)
npx prisma generate

# Optional: seed initial data (admin user, sample products, etc.)
npx tsx src/lib/scripts/seed.ts
```

## 4. Verify

```bash
npx tsx src/lib/scripts/health-check.ts
```

You should see `Database Connection: ✅ OK`.

---

**Summary:** Only **`DATABASE_URL`** is required. Point it at your new Postgres instance, then run `npx prisma db push` (and optionally the seed script).
