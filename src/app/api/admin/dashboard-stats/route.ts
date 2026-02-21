import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)
    
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    
    const last7DaysStart = new Date(todayStart)
    last7DaysStart.setDate(last7DaysStart.getDate() - 7)
    
    const last30DaysStart = new Date(todayStart)
    last30DaysStart.setDate(last30DaysStart.getDate() - 30)

    // Today's stats
    const ordersToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    })

    const revenueToday = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
        paymentStatus: 'PAID',
      },
      _sum: {
        totalAmount: true,
      },
    })

    // Yesterday's stats for comparison
    const ordersYesterday = await prisma.order.count({
      where: {
        createdAt: {
          gte: yesterdayStart,
          lt: todayStart,
        },
      },
    })

    const revenueYesterday = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: yesterdayStart,
          lt: todayStart,
        },
        paymentStatus: 'PAID',
      },
      _sum: {
        totalAmount: true,
      },
    })

    // Calculate percentage changes
    const ordersChange = ordersYesterday > 0 
      ? ((ordersToday - ordersYesterday) / ordersYesterday * 100).toFixed(1)
      : ordersToday > 0 ? '100' : '0'
    
    const revenueChange = revenueYesterday._sum.totalAmount && Number(revenueYesterday._sum.totalAmount) > 0
      ? ((Number(revenueToday._sum.totalAmount || 0) - Number(revenueYesterday._sum.totalAmount)) / Number(revenueYesterday._sum.totalAmount) * 100).toFixed(1)
      : Number(revenueToday._sum.totalAmount || 0) > 0 ? '100' : '0'

    // Total products
    const totalProducts = await prisma.product.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    })

    // Total customers
    const totalCustomers = await prisma.customer.count({
      where: {
        isActive: true,
      },
    })

    // Average Order Value (Today)
    const avgOrderValue = ordersToday > 0
      ? Number(revenueToday._sum.totalAmount || 0) / ordersToday
      : 0

    // Pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'PROCESSING'],
        },
      },
    })

    // Low stock items
    const lowStockInventory = await prisma.productInventory.findMany({
      where: {
        isTracked: true,
      },
      select: {
        quantity: true,
        minQuantity: true,
      },
    })
    
    const lowStockItems = lowStockInventory.filter(
      inv => inv.quantity <= inv.minQuantity
    ).length

    // Revenue trend (last 7 days)
    const revenueTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart)
      date.setDate(date.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const revenue = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
          paymentStatus: 'PAID',
        },
        _sum: {
          totalAmount: true,
        },
      })

      revenueTrend.push({
        date: date.toISOString().split('T')[0],
        revenue: Number(revenue._sum.totalAmount || 0),
      })
    }

    // Order volume trend (last 7 days)
    const orderTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart)
      date.setDate(date.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await prisma.order.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      orderTrend.push({
        date: date.toISOString().split('T')[0],
        orders: count,
      })
    }

    // Order status distribution
    const orderStatusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    const orderStatusDistribution = orderStatusCounts.map(item => ({
      status: item.status,
      count: item._count.id,
    }))

    // Payment status distribution
    const paymentStatusCounts = await prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: {
        id: true,
      },
    })

    const paymentStatusDistribution = paymentStatusCounts.map(item => ({
      status: item.paymentStatus,
      count: item._count.id,
    }))

    // Top selling products (last 30 days)
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: {
        order: {
          createdAt: {
            gte: last30DaysStart,
          },
          paymentStatus: 'PAID',
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    })

    // Sales by category (last 30 days)
    const categorySales = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: last30DaysStart,
          },
          paymentStatus: 'PAID',
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    })

    const categoryRevenueMap = new Map<string, number>()
    categorySales.forEach(item => {
      const categoryName = item.product.category.name
      const current = categoryRevenueMap.get(categoryName) || 0
      categoryRevenueMap.set(categoryName, current + Number(item.totalPrice))
    })

    const salesByCategory = Array.from(categoryRevenueMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    })

    // New customers trend (last 7 days)
    const newCustomersTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart)
      date.setDate(date.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await prisma.customer.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      newCustomersTrend.push({
        date: date.toISOString().split('T')[0],
        customers: count,
      })
    }

    // Total revenue (last 30 days)
    const totalRevenue30Days = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: last30DaysStart,
        },
        paymentStatus: 'PAID',
      },
      _sum: {
        totalAmount: true,
      },
    })

    // Total orders (last 30 days)
    const totalOrders30Days = await prisma.order.count({
      where: {
        createdAt: {
          gte: last30DaysStart,
        },
      },
    })

    return NextResponse.json({
      stats: {
        ordersToday: {
          value: ordersToday,
          change: ordersChange,
        },
        revenueToday: {
          value: Number(revenueToday._sum.totalAmount || 0),
          change: revenueChange,
        },
        totalProducts,
        totalCustomers,
        avgOrderValue,
        pendingOrders,
        lowStockItems,
        totalRevenue30Days: Number(totalRevenue30Days._sum.totalAmount || 0),
        totalOrders30Days,
      },
      charts: {
        revenueTrend,
        orderTrend,
        orderStatusDistribution,
        paymentStatusDistribution,
        topProducts: topProducts.map(p => ({
          name: p.productName,
          quantity: Number(p._sum.quantity || 0),
          revenue: Number(p._sum.totalPrice || 0),
        })),
        salesByCategory,
        newCustomersTrend,
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

