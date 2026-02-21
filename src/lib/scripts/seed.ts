#!/usr/bin/env tsx

import { MigrationService } from '../migration'

async function main() {
  console.log('🌱 Starting Database Seeding...')
  
  const result = await MigrationService.seedDatabase()
  
  if (result.success) {
    console.log('✅ Database seeding completed successfully!')
    process.exit(0)
  } else {
    console.error('❌ Database seeding failed:', result.message)
    if (result.error) {
      console.error('Error details:', result.error)
    }
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
