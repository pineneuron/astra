import { prisma } from '@/lib/db'
import { Prisma, OrderStatus, CouponType, PageStatus } from '@prisma/client'

export type Coordinates = { lat: number; lng: number } | null | undefined

/* eslint-disable @typescript-eslint/no-explicit-any */

// ===========================================
// PRODUCT SERVICES
// ===========================================

export class ProductService {
  static async getAllCategories() {
    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null, // Exclude soft-deleted categories
        isActive: true
      },
      include: {
        productLinks: {
          include: {
            product: {
              include: {
                images: true,
                variations: true,
                inventory: true
              }
            }
          },
          where: { product: { isActive: true } }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })
    
    // Sort products by sortOrder for each category
    return categories.map(cat => ({
      ...cat,
      productLinks: cat.productLinks.sort((a, b) => a.product.sortOrder - b.product.sortOrder)
    }))
  }

  static async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        productLinks: {
          include: {
            product: {
              include: {
                images: true,
                variations: true,
                inventory: true
              }
            }
          },
          where: { product: { isActive: true } }
        }
      }
    })
    
    if (!category) return null
    
    // Sort products by sortOrder
    return {
      ...category,
      productLinks: category.productLinks.sort((a, b) => a.product.sortOrder - b.product.sortOrder)
    }
  }

  static async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        variations: true,
        inventory: true
      }
    })
  }

  static async getProductBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        variations: true,
        inventory: true
      }
    })
  }

  static async getFeaturedProducts(limit: number = 8) {
    return prisma.product.findMany({
      where: { 
        isFeatured: true,
        isActive: true 
      },
      include: {
        images: true,
        variations: true,
        inventory: true
      },
      orderBy: { sortOrder: 'asc' },
      take: limit
    })
  }

  static async getBestsellerProducts(limit: number = 8) {
    return prisma.product.findMany({
      where: { 
        isBestseller: true,
        isActive: true 
      },
      include: {
        images: true,
        variations: true,
        inventory: true
      },
      orderBy: { sortOrder: 'asc' },
      take: limit
    })
  }

  static async searchProducts(query: string, categoryId?: string) {
    return prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          categoryId ? { categoryId } : {},
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { shortDescription: { contains: query, mode: 'insensitive' } },
              { tags: { has: query } }
            ]
          }
        ]
      },
      include: {
        category: true,
        images: true,
        variations: true,
        inventory: true
      },
      orderBy: { sortOrder: 'asc' }
    })
  }

  static async updateInventory(productId: string, quantity: number) {
    return prisma.productInventory.upsert({
      where: { productId },
      update: { quantity },
      create: {
        productId,
        quantity
      }
    })
  }
}

// ===========================================
// PAGE SERVICES
// ===========================================

export class PageService {
  static async getAllPages() {
    return prisma.page.findMany({
      orderBy: [{ updatedAt: 'desc' }],
    })
  }

  static async getPageById(id: string) {
    return prisma.page.findUnique({
      where: { id },
    })
  }

  static async getPageBySlug(slug: string) {
    return prisma.page.findUnique({
      where: { slug },
    })
  }

  static async createPage(data: {
    title: string
    slug: string
    template: string
    content?: Prisma.InputJsonValue
    seo?: Prisma.InputJsonValue
    status?: PageStatus
    publishedAt?: Date | null
  }) {
    return prisma.page.create({ data })
  }

  static async updatePage(id: string, data: Partial<{
    title: string
    slug: string
    template: string
    content: Prisma.InputJsonValue
    seo: Prisma.InputJsonValue
    status: PageStatus
    publishedAt: Date | null
  }>) {
    return prisma.page.update({
      where: { id },
      data,
    })
  }

  static async deletePage(id: string) {
    return prisma.page.delete({
      where: { id },
    })
  }

  static async publishPage(id: string) {
    return prisma.page.update({
      where: { id },
      data: {
        status: PageStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    })
  }
}

// ===========================================
// ORDER SERVICES
// ===========================================

export class OrderService {
  static async createOrder(orderData: {
    customerId?: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    customerCity?: string
    customerAddress?: string
    customerLandmark?: string
    customerCoordinates?: Coordinates
    customerNotes?: string
    items: Array<{
      productId: string
      productName: string
      productImageUrl?: string
      variationName?: string
      quantity: number
      unitPrice: number
      discountAmount?: number
      totalPrice: number
    }>
    subtotal: number
    deliveryFee: number
    discountAmount: number
    taxAmount?: number
    totalAmount: number
    paymentMethod?: string
    deliveryDate?: Date
    deliveryTimeSlot?: string
    notes?: string
  }) {
    const orderNumber = this.generateOrderNumber()

    return prisma.order.create({
      data: {
        orderNumber,
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        customerCity: orderData.customerCity,
        customerAddress: orderData.customerAddress,
        customerLandmark: orderData.customerLandmark,
        customerCoordinates: orderData.customerCoordinates as any,
        customerNotes: orderData.customerNotes,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        discountAmount: orderData.discountAmount,
        taxAmount: orderData.taxAmount || 0,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        deliveryDate: orderData.deliveryDate,
        deliveryTimeSlot: orderData.deliveryTimeSlot,
        notes: orderData.notes,
        items: {
          create: orderData.items
        },
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            notes: 'Order created'
          }
        }
      },
      include: {
        items: true,
        customer: true,
        statusHistory: true
      }
    })
  }

  static async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        couponUsage: {
          include: {
            coupon: true
          }
        }
      }
    })
  }

  static async getOrderByNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        couponUsage: {
          include: {
            coupon: true
          }
        }
      }
    })
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string) {
    return prisma.$transaction(async (tx) => {
      // Update order status
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status }
      })

      // Add status history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          notes
        }
      })

      return order
    })
  }

  static async getOrdersByCustomer(customerId: string, limit: number = 10) {
    return prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString()
    return `TSF-${timestamp.slice(-6)}`
  }
}

// ===========================================
// COUPON SERVICES
// ===========================================

export class CouponService {
  static async validateCoupon(code: string, orderAmount: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' }
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'This coupon is not active' }
    }

    const now = new Date()
    if (now < coupon.startDate) {
      return { valid: false, message: 'This coupon is not yet valid' }
    }

    if (now > coupon.endDate) {
      return { valid: false, message: 'This coupon has expired' }
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon has reached its usage limit' }
    }

    if (orderAmount < Number(coupon.minOrderAmount)) {
      return { 
        valid: false, 
        message: `Minimum order amount of Rs. ${coupon.minOrderAmount} required for this coupon` 
      }
    }

    let discountAmount = 0
    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = (orderAmount * Number(coupon.value)) / 100
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount))
      }
    } else if (coupon.type === CouponType.FLAT) {
      discountAmount = Number(coupon.value)
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount))
      }
    }

    return { 
      valid: true, 
      coupon, 
      discountAmount: Math.round(discountAmount * 100) / 100 
    }
  }

  static async applyCoupon(couponId: string, orderId: string, customerId?: string, discountAmount: number = 0) {
    return prisma.$transaction(async (tx) => {
      // Create coupon usage record
      const couponUsage = await tx.couponUsage.create({
        data: {
          couponId,
          orderId,
          customerId,
          discountAmount
        }
      })

      // Update coupon usage count
      await tx.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: {
            increment: 1
          }
        }
      })

      return couponUsage
    })
  }

  static async getAllCoupons() {
    return prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
  }
}

// ===========================================
// CUSTOMER SERVICES
// ===========================================

export class CustomerService {
  static async createCustomer(customerData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    city?: string
    address?: string
    landmark?: string
    coordinates?: Coordinates
  }) {
    return prisma.customer.create({
      data: customerData as any
    })
  }

  static async getCustomerByEmail(email: string) {
    return prisma.customer.findUnique({
      where: { email },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })
  }

  static async updateCustomer(id: string, data: Record<string, unknown>) {
    return prisma.customer.update({
      where: { id },
      data
    })
  }

  static async addCustomerAddress(customerId: string, addressData: {
    type: string
    name: string
    address: string
    city: string
    landmark?: string
    coordinates?: Coordinates
    isDefault?: boolean
  }) {
    return prisma.customerAddress.create({
      data: {
        customerId,
        ...addressData
      } as any
    })
  }
}

// ===========================================
// SYSTEM SERVICES
// ===========================================

export class SystemService {
  static async getSetting(key: string) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key }
    })
    return setting?.value
  }

  static async setSetting(key: string, value: string, type: string = 'string', category: string = 'general') {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value, type, category },
      create: { key, value, type, category }
    })
  }

  static async logAudit(
    tableName: string,
    recordId: string,
    action: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    return prisma.auditLog.create({
      data: {
        tableName,
        recordId,
        action,
        oldValues: oldValues as any,
        newValues: newValues as any,
        userId,
        ipAddress,
        userAgent
      }
    })
  }
}
