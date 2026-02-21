import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD
  if (!adminEmail) {
    console.error('ADMIN_EMAIL env not set')
    process.exit(1)
  }
  const user = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (user) {
    const data = { role: Role.ADMIN }
    if (adminPassword) {
      data.password = await bcrypt.hash(adminPassword, 10)
    }
    await prisma.user.update({ where: { id: user.id }, data })
    console.log(`Promoted existing user ${adminEmail} to ADMIN${adminPassword ? ' and set password' : ''}`)
  } else {
    const data = {
      email: adminEmail,
      role: Role.ADMIN,
      password: adminPassword ? await bcrypt.hash(adminPassword, 10) : null,
      name: process.env.ADMIN_NAME || 'Admin'
    }
    const created = await prisma.user.create({ data })
    console.log(`Created ADMIN user ${created.email}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
