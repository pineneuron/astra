#!/usr/bin/env tsx

import { MigrationService } from '../migration'

async function main() {
  console.log('⚠️  WARNING: This will delete ALL data from the database!')
  console.log('Are you sure you want to continue? (y/N)')
  
  // In a real scenario, you'd want to add readline for user input
  // For now, we'll add a safety check
  const args = process.argv.slice(2)
  if (args[0] !== '--force') {
    console.log('❌ Use --force flag to confirm database reset')
    console.log('Example: pnpm db:reset --force')
    process.exit(1)
  }
  
  console.log('🗑️  Resetting database...')
  
  const result = await MigrationService.resetDatabase()
  
  if (result.success) {
    console.log('✅ Database reset completed successfully!')
    process.exit(0)
  } else {
    console.error('❌ Database reset failed:', result.message)
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
