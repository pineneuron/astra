import { prisma } from '@/lib/db'
import { ProductService, CouponService } from '@/lib/services'
import { CouponType } from '@prisma/client'
import { DatabaseUtils, ErrorUtils } from '@/lib/utils'

// Types for JSON data
type JsonProduct = {
  id: string
  name: string
  price: number
  unit: string
  discountPercent: number
  image: string
  images?: string[]
  shortDescription?: string
  variations?: Array<{
    name: string
    price: number
    discountPercent?: number
  }>
  defaultVariation?: string
  featured?: boolean
  bestseller?: boolean
}

type JsonCategory = {
  id: string
  name: string
  products: JsonProduct[]
}

type JsonCoupon = {
  id: string
  code: string
  name: string
  description: string
  type: string
  value: number
  minOrderAmount: number
  maxDiscountAmount: number
  startDate: string
  endDate: string
  isActive: boolean
  usageLimit: number
  usedCount: number
}

// ===========================================
// MIGRATION SCRIPTS
// ===========================================

export class MigrationService {
  /**
   * Migrate data from JSON files to database
   */
  static async migrateFromJSON() {
    try {
      console.log('Starting data migration...')

      // Import JSON data
      const productsData = await import('../../public/data/products.json') as { categories: JsonCategory[] }
      const couponData = await import('../../public/data/coupon_codes.json') as { coupons: JsonCoupon[] }

      // Migrate categories and products
      for (const category of productsData.categories) {
        console.log(`Migrating category: ${category.name}`)

        // Create category
        await prisma.category.upsert({
          where: { id: category.id },
          update: {
            name: category.name,
            slug: category.id,
            isActive: true
          },
          create: {
            id: category.id,
            name: category.name,
            slug: category.id,
            isActive: true
          }
        })

        // Migrate products
        for (const product of category.products) {
          console.log(`  Migrating product: ${product.name}`)

          // Create product
          await prisma.product.upsert({
            where: { id: product.id },
            update: {
              categoryId: category.id,
              name: product.name,
              slug: product.id,
              shortDescription: product.shortDescription || null,
              basePrice: product.price,
              unit: product.unit,
              discountPercent: product.discountPercent,
              imageUrl: product.image,
              isFeatured: product.featured || false,
              isBestseller: product.bestseller || false,
              isActive: true
            },
            create: {
              id: product.id,
              categoryId: category.id,
              name: product.name,
              slug: product.id,
              shortDescription: product.shortDescription || null,
              basePrice: product.price,
              unit: product.unit,
              discountPercent: product.discountPercent,
              imageUrl: product.image,
              isFeatured: product.featured || false,
              isBestseller: product.bestseller || false,
              isActive: true
            }
          })

          // Migrate product images
          if (product.images && product.images.length > 0) {
            for (let i = 0; i < product.images.length; i++) {
              await prisma.productImage.upsert({
                where: {
                  productId_imageUrl: {
                    productId: product.id,
                    imageUrl: product.images[i]
                  }
                },
                update: {
                  sortOrder: i,
                  isPrimary: i === 0
                },
                create: {
                  productId: product.id,
                  imageUrl: product.images[i],
                  sortOrder: i,
                  isPrimary: i === 0
                }
              })
            }
          }

          // Migrate product variations
          if (product.variations && product.variations.length > 0) {
            for (const variation of product.variations) {
          await prisma.productVariation.upsert({
                where: {
                  productId_name: {
                    productId: product.id,
                    name: variation.name
                  }
                },
                update: {
                  price: variation.price,
                  discountPercent: variation.discountPercent || 0,
                  isDefault: variation.name === product.defaultVariation
                },
                create: {
                  productId: product.id,
                  name: variation.name,
                  price: variation.price,
                  discountPercent: variation.discountPercent || 0,
                  isDefault: variation.name === product.defaultVariation
                }
              })
            }
          }

          // Create inventory record
          await prisma.productInventory.upsert({
            where: { productId: product.id },
            update: {
              quantity: 100, // Default stock
              minQuantity: 10,
              isTracked: true
            },
            create: {
              productId: product.id,
              quantity: 100,
              minQuantity: 10,
              isTracked: true
            }
          })
        }
      }

      // Migrate coupons
      for (const coupon of couponData.coupons) {
        console.log(`Migrating coupon: ${coupon.code}`)

        await prisma.coupon.upsert({
          where: { id: coupon.id },
          update: {
            code: coupon.code,
            name: coupon.name,
            description: coupon.description,
            type: coupon.type.toUpperCase() as CouponType,
            value: coupon.value,
            minOrderAmount: coupon.minOrderAmount,
            maxDiscountAmount: coupon.maxDiscountAmount,
            startDate: new Date(coupon.startDate),
            endDate: new Date(coupon.endDate),
            isActive: coupon.isActive,
            usageLimit: coupon.usageLimit,
            usedCount: coupon.usedCount
          },
          create: {
            id: coupon.id,
            code: coupon.code,
            name: coupon.name,
            description: coupon.description,
            type: coupon.type.toUpperCase() as CouponType,
            value: coupon.value,
            minOrderAmount: coupon.minOrderAmount,
            maxDiscountAmount: coupon.maxDiscountAmount,
            startDate: new Date(coupon.startDate),
            endDate: new Date(coupon.endDate),
            isActive: coupon.isActive,
            usageLimit: coupon.usageLimit,
            usedCount: coupon.usedCount
          }
        })
      }

      // Initialize system settings
      await this.initializeSystemSettings()

      console.log('Data migration completed successfully!')
      return { success: true, message: 'Migration completed successfully' }

    } catch (error) {
      console.error('Migration failed:', error)
      ErrorUtils.logError(error, 'MIGRATION')
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, message: 'Migration failed', error: message }
    }
  }

  /**
   * Initialize system settings
   */
  static async initializeSystemSettings() {
    const defaultSettings = [
      { key: 'site_name', value: '3 Star Foods', type: 'string', category: 'general' },
      { key: 'site_description', value: 'Premium quality meat and frozen food products', type: 'string', category: 'general' },
      { key: 'currency', value: 'NPR', type: 'string', category: 'general' },
      { key: 'currency_symbol', value: 'Rs.', type: 'string', category: 'general' },
      { key: 'min_order_amount', value: '500', type: 'number', category: 'orders' },
      { key: 'delivery_fee', value: '100', type: 'number', category: 'orders' },
      { key: 'free_delivery_threshold', value: '1500', type: 'number', category: 'orders' },
      { key: 'tax_rate', value: '13', type: 'number', category: 'orders' },
      { key: 'contact_email', value: 'info@3starfoods.com', type: 'string', category: 'contact' },
      { key: 'contact_phone', value: '+977-1-2345678', type: 'string', category: 'contact' },
      { key: 'business_hours', value: '9:00 AM - 7:00 PM', type: 'string', category: 'contact' },
      { key: 'delivery_areas', value: 'Kathmandu, Lalitpur, Bhaktapur', type: 'string', category: 'delivery' },
      { key: 'notifications_order_emails', value: 'admin@3starfoods.com', type: 'string', category: 'notifications' },
      { key: 'notifications_contact_emails', value: 'info@3starfoods.com', type: 'string', category: 'notifications' },
      { key: 'smtp_host', value: '', type: 'string', category: 'smtp' },
      { key: 'smtp_port', value: '587', type: 'number', category: 'smtp' },
      { key: 'smtp_user', value: '', type: 'string', category: 'smtp' },
      { key: 'smtp_pass', value: '', type: 'string', category: 'smtp' },
      { key: 'smtp_from_email', value: 'noreply@3starfoods.com', type: 'string', category: 'smtp' },
      { key: 'smtp_from_name', value: '3 Star Foods', type: 'string', category: 'smtp' }
    ]

    for (const setting of defaultSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting
      })
    }
  }

  /**
   * Reset database (WARNING: This will delete all data)
   */
  static async resetDatabase() {
    try {
      console.log('WARNING: Resetting database - all data will be lost!')
      
      // Delete all data in reverse order of dependencies
      await prisma.couponUsage.deleteMany()
      await prisma.orderStatusHistory.deleteMany()
      await prisma.orderItem.deleteMany()
      await prisma.order.deleteMany()
      await prisma.customerAddress.deleteMany()
      await prisma.customer.deleteMany()
      await prisma.productInventory.deleteMany()
      await prisma.productVariation.deleteMany()
      await prisma.productImage.deleteMany()
      await prisma.product.deleteMany()
      await prisma.category.deleteMany()
      await prisma.coupon.deleteMany()
      await prisma.systemSetting.deleteMany()
      await prisma.auditLog.deleteMany()

      console.log('Database reset completed')
      return { success: true, message: 'Database reset completed' }

    } catch (error) {
      console.error('Database reset failed:', error)
      ErrorUtils.logError(error, 'RESET')
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, message: 'Database reset failed', error: message }
    }
  }

  /**
   * Seed database with sample data
   */
  static async seedDatabase() {
    try {
      console.log('Seeding database with sample data...')

      // Create sample categories
      const categories = [
        { id: 'chicken', name: 'Chicken Items', slug: 'chicken-items' },
        { id: 'fish', name: 'Fish Items', slug: 'fish-items' },
        { id: 'mutton', name: 'Mutton Items', slug: 'mutton-items' }
      ]

      for (const category of categories) {
        await prisma.category.create({
          data: category
        })
      }

      // Create sample products
      const products = [
        {
          id: 'sample-chicken-1',
          categoryId: 'chicken',
          name: 'Sample Chicken Product',
          slug: 'sample-chicken-product',
          basePrice: 500,
          unit: 'per kg',
          isActive: true
        }
      ]

      for (const product of products) {
        await prisma.product.create({
          data: product
        })
      }

      console.log('Database seeding completed')
      return { success: true, message: 'Database seeding completed' }

    } catch (error) {
      console.error('Database seeding failed:', error)
      ErrorUtils.logError(error, 'SEEDING')
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, message: 'Database seeding failed', error: message }
    }
  }
}

// ===========================================
// HEALTH CHECK SERVICE
// ===========================================

export class HealthCheckService {
  /**
   * Perform comprehensive health check
   */
  static async performHealthCheck() {
    const results = {
      database: false,
      services: {
        product: false,
        order: false,
        coupon: false,
        customer: false
      },
      stats: null as Awaited<ReturnType<typeof DatabaseUtils.getStats>> | null,
      timestamp: new Date().toISOString()
    }

    try {
      // Check database connection
      results.database = await DatabaseUtils.checkConnection()

      if (results.database) {
        // Test service functions
        try {
          await ProductService.getAllCategories()
          results.services.product = true
        } catch (error) {
          console.error('Product service check failed:', error)
        }

        try {
          await CouponService.getAllCoupons()
          results.services.coupon = true
        } catch (error) {
          console.error('Coupon service check failed:', error)
        }

        // Get database stats
        results.stats = await DatabaseUtils.getStats()
      }

      return results

    } catch (error) {
      console.error('Health check failed:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { ...results, error: message }
    }
  }
}
