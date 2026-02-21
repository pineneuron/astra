#!/usr/bin/env tsx

import 'dotenv/config'
import { MigrationService } from '../migration'

async function main() {
  console.log('🚀 Starting JSON to Database Migration...')
  
  const result = await MigrationService.migrateFromJSON()
  
  if (result.success) {
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } else {
    console.error('❌ Migration failed:', result.message)
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
