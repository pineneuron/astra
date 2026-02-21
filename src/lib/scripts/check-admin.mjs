import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@3starfoods.test'
  const user = await prisma.user.findUnique({ 
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
      createdAt: true,
    }
  })

  if (!user) {
    console.log(`❌ User not found: ${email}`)
    console.log('\nTo create admin user, run:')
    console.log('  ADMIN_EMAIL=admin@3starfoods.test ADMIN_PASSWORD=yourpassword node src/lib/scripts/seed-admin.mjs')
  } else {
    console.log(`✅ User found: ${email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Name: ${user.name || 'N/A'}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Password: ${user.password ? '✅ SET' : '❌ NOT SET'}`)
    console.log(`   Created: ${user.createdAt}`)
    
    if (!user.password) {
      console.log('\n⚠️  User has no password set!')
      console.log('To set password, run:')
      console.log(`  ADMIN_EMAIL=${email} ADMIN_PASSWORD=yourpassword node src/lib/scripts/seed-admin.mjs`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})

