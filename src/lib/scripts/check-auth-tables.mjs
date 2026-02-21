import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tables = [
    'public."User"',
    'public."Account"',
    'public."Session"',
    'public."VerificationToken"'
  ]

  const results = {}

  for (const t of tables) {
    const [{ exists }] = await prisma.$queryRawUnsafe(
      `SELECT to_regclass('${t}') IS NOT NULL AS exists;`
    )
    results[t] = Boolean(exists)
  }

  const [{ role_enum }] = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') AS role_enum;`
  )

  console.log('Auth table existence:', results)
  console.log('Role enum exists:', Boolean(role_enum))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
