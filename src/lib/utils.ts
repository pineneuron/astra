import { prisma } from '@/lib/db'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ===========================================
// DATABASE UTILITIES
// ===========================================

export class DatabaseUtils {
  /**
   * Check database connection
   */
  static async checkConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  }

  /**
   * Get database statistics
   */
  static async getStats() {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalCustomers,
      totalCoupons
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.coupon.count()
    ])

    return {
      totalProducts,
      totalCategories,
      totalOrders,
      totalCustomers,
      totalCoupons
    }
  }

  /**
   * Clean up old audit logs (older than 90 days)
   */
  static async cleanupAuditLogs() {
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    })

    return result.count
  }

  /**
   * Backup database (export all data)
   */
  static async exportData() {
    const data = {
      categories: await prisma.category.findMany({
        include: {
          products: {
            include: {
              images: true,
              variations: true,
              inventory: true
            }
          }
        }
      }),
      coupons: await prisma.coupon.findMany(),
      systemSettings: await prisma.systemSetting.findMany()
    }

    return data
  }
}

// ===========================================
// VALIDATION UTILITIES
// ===========================================

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate password strength
   * Requirements:
   * - Minimum 8 characters
   * - At least one letter (a-z or A-Z)
   * - At least one number (0-9)
   */
  static validatePassword(password: string): { valid: boolean; error?: string } {
    if (!password || password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters long' }
    }

    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (!hasLetter) {
      return { valid: false, error: 'Password must contain at least one letter' }
    }

    if (!hasNumber) {
      return { valid: false, error: 'Password must contain at least one number' }
    }

    return { valid: true }
  }

  /**
   * Validate phone number (Nepal format)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+977)?[0-9]{10}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  /**
   * Validate order data
   */
  static validateOrderData(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    const customerName = (data.customerName as string) ?? ''
    if (!customerName || customerName.trim().length < 2) {
      errors.push('Customer name is required and must be at least 2 characters')
    }

    const customerEmail = (data.customerEmail as string) ?? ''
    if (!customerEmail || !this.isValidEmail(customerEmail)) {
      errors.push('Valid customer email is required')
    }

    const customerPhone = data.customerPhone as string | undefined
    if (customerPhone && !this.isValidPhone(customerPhone)) {
      errors.push('Invalid phone number format')
    }

    const items = data.items as unknown[] | undefined
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('At least one item is required')
    }

    const totalAmount = Number(data.totalAmount ?? 0)
    if (!totalAmount || totalAmount <= 0) {
      errors.push('Total amount must be greater than 0')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }

  /**
   * Generate slug from string
   */
  static generateSlug(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

// ===========================================
// PRICING UTILITIES
// ===========================================

export class PricingUtils {
  /**
   * Calculate discounted price
   */
  static calculateDiscountedPrice(price: number, discountPercent: number): number {
    if (discountPercent <= 0) return price
    return Math.round(price * (1 - discountPercent / 100) * 100) / 100
  }

  /**
   * Calculate order totals
   */
  static calculateOrderTotals(items: Array<{
    quantity: number
    unitPrice: number
    discountAmount?: number
  }>, deliveryFee: number = 0, couponDiscount: number = 0) {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.unitPrice * item.quantity
      const itemDiscount = item.discountAmount || 0
      return sum + itemTotal - itemDiscount
    }, 0)

    const totalDiscount = couponDiscount
    const totalAmount = subtotal + deliveryFee - totalDiscount

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      discountAmount: Math.round(totalDiscount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    }
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string = 'Rs.'): string {
    return `${currency} ${amount.toFixed(2)}`
  }
}

// ===========================================
// FILE UTILITIES
// ===========================================

export class FileUtils {
  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed.' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 5MB.' }
    }

    return { valid: true }
  }

  /**
   * Generate unique filename
   */
  static generateFileName(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    return `${timestamp}-${random}.${extension}`
  }
}

// ===========================================
// DATE UTILITIES
// ===========================================

export class DateUtils {
  /**
   * Format date for display
   */
  static formatDate(date: Date, format: 'short' | 'long' | 'time' = 'short'): string {
    const options: Record<string, Intl.DateTimeFormatOptions> = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      time: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    }

    return date.toLocaleDateString('en-US', options[format])
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  static getRelativeTime(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return this.formatDate(date, 'short')
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
}

// ===========================================
// ERROR HANDLING UTILITIES
// ===========================================

export class ErrorUtils {
  /**
   * Handle Prisma errors
   */
  static handlePrismaError(error: unknown): { message: string; code?: string } {
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2002') {
      return { message: 'A record with this information already exists', code: 'DUPLICATE' }
    }
    if (err.code === 'P2025') {
      return { message: 'Record not found', code: 'NOT_FOUND' }
    }
    if (err.code === 'P2003') {
      return { message: 'Foreign key constraint failed', code: 'FOREIGN_KEY' }
    }
    
    return { message: err.message || 'An unexpected error occurred' }
  }

  /**
   * Log error with context
   */
  static logError(error: unknown, context?: string) {
    const err = error as { message?: string; stack?: string }
    console.error(`[${context || 'UNKNOWN'}] Error:`, {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    })
  }
}
