#!/usr/bin/env tsx

import 'dotenv/config'
import { DatabaseUtils } from '../utils'
import fs from 'fs'
import path from 'path'

async function main() {
  console.log('💾 Creating Database Backup...')
  
  try {
    const data = await DatabaseUtils.exportData()
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${timestamp}.json`
    const filepath = path.join(process.cwd(), 'backups', filename)
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }
    
    // Write backup file
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
    
    console.log(`✅ Backup created successfully: ${filename}`)
    console.log(`📁 Location: ${filepath}`)
    
    // Show backup summary
    console.log('\n📊 Backup Summary:')
    console.log('==================')
    console.log(`Categories: ${data.categories.length}`)
    console.log(`Products: ${data.categories.reduce((sum, cat) => sum + cat.products.length, 0)}`)
    console.log(`Coupons: ${data.coupons.length}`)
    console.log(`Settings: ${data.systemSettings.length}`)
    
    process.exit(0)
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Backup failed:', message)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
