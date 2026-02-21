#!/usr/bin/env tsx

import 'dotenv/config'
import { HealthCheckService } from '../migration'

async function main() {
  console.log('🏥 Performing Health Check...')
  
  const result = await HealthCheckService.performHealthCheck()
  
  console.log('\n📊 Health Check Results:')
  console.log('========================')
  console.log(`Database Connection: ${result.database ? '✅ OK' : '❌ FAILED'}`)
  console.log(`Product Service: ${result.services.product ? '✅ OK' : '❌ FAILED'}`)
  console.log(`Order Service: ${result.services.order ? '✅ OK' : '❌ FAILED'}`)
  console.log(`Coupon Service: ${result.services.coupon ? '✅ OK' : '❌ FAILED'}`)
  console.log(`Customer Service: ${result.services.customer ? '✅ OK' : '❌ FAILED'}`)
  
  if (result.stats) {
    console.log('\n📈 Database Statistics:')
    console.log('=======================')
    console.log(`Categories: ${result.stats.totalCategories}`)
    console.log(`Products: ${result.stats.totalProducts}`)
    console.log(`Orders: ${result.stats.totalOrders}`)
    console.log(`Customers: ${result.stats.totalCustomers}`)
    console.log(`Coupons: ${result.stats.totalCoupons}`)
  }
  
  if ('error' in result && result.error) {
    console.log('\n❌ Error:', result.error)
    process.exit(1)
  }
  
  console.log(`\n🕐 Check completed at: ${result.timestamp}`)
  process.exit(0)
}

main().catch((error) => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
