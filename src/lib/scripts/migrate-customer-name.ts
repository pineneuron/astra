import { prisma } from '../db'

async function migrateCustomerNames() {
  console.log('Starting customer name migration...')
  
  try {
    // Step 1: Add the name column if it doesn't exist
    console.log('Step 1: Adding name column...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    `)
    console.log('✓ Name column added')
    
    // Step 2: Migrate existing data from firstName + lastName to name
    console.log('Step 2: Migrating data from first_name and last_name to name...')
    await prisma.$executeRawUnsafe(`
      UPDATE customers 
      SET name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
      WHERE name IS NULL 
        AND (first_name IS NOT NULL OR last_name IS NOT NULL);
    `)
    console.log('✓ Data migrated')
    
    // Step 3: Drop the old columns
    console.log('Step 3: Dropping old columns...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE customers 
      DROP COLUMN IF EXISTS first_name,
      DROP COLUMN IF EXISTS last_name;
    `)
    console.log('✓ Old columns dropped')
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateCustomerNames()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
