import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import DashboardClient from './DashboardClient'
import DashboardLoading from './DashboardLoading'

export const dynamic = 'force-dynamic'

async function DashboardData() {
  const data = await getDashboardStats()
  return <DashboardClient {...data} />
}

async function getDashboardStats() {
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
    const [ordersToday, revenueToday, ordersYesterday, revenueYesterday] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: todayStart, lt: todayEnd },
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: yesterdayStart, lt: todayStart },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: yesterdayStart, lt: todayStart },
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      }),
    ])

    // Calculate percentage changes
    const ordersChange = ordersYesterday > 0
      ? ((ordersToday - ordersYesterday) / ordersYesterday * 100).toFixed(1)
      : ordersToday > 0 ? '100' : '0'

    const revenueChange = revenueYesterday._sum.totalAmount && Number(revenueYesterday._sum.totalAmount) > 0
      ? ((Number(revenueToday._sum.totalAmount || 0) - Number(revenueYesterday._sum.totalAmount)) / Number(revenueYesterday._sum.totalAmount) * 100).toFixed(1)
      : Number(revenueToday._sum.totalAmount || 0) > 0 ? '100' : '0'

    // Other stats
    const [totalProducts, totalCustomers, pendingOrders, lowStockInventory] = await Promise.all([
      prisma.product.count({
        where: { isActive: true, deletedAt: null },
      }),
      prisma.customer.count({
        where: { isActive: true },
      }),
      prisma.order.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] },
        },
      }),
      prisma.productInventory.findMany({
        where: { isTracked: true },
        select: { quantity: true, minQuantity: true },
      }),
    ])

    const lowStockItems = lowStockInventory.filter(
      inv => inv.quantity <= inv.minQuantity
    ).length

    const avgOrderValue = ordersToday > 0
      ? Number(revenueToday._sum.totalAmount || 0) / ordersToday
      : 0

    // Revenue trend (last 7 days)
    const revenueTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart)
      date.setDate(date.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const revenue = await prisma.order.aggregate({
        where: {
          createdAt: { gte: date, lt: nextDate },
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
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
        where: { createdAt: { gte: date, lt: nextDate } },
      })

      orderTrend.push({
        date: date.toISOString().split('T')[0],
        orders: count,
      })
    }

    // Order status distribution
    const orderStatusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const orderStatusDistribution = orderStatusCounts.map(item => ({
      status: item.status,
      count: item._count.id,
    }))

    // Payment status distribution
    const paymentStatusCounts = await prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: { id: true },
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
          createdAt: { gte: last30DaysStart },
          paymentStatus: 'PAID',
        },
      },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    })

    // Sales by category (last 30 days)
    const categorySales = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: last30DaysStart },
          paymentStatus: 'PAID',
        },
      },
      include: {
        product: { include: { category: true } },
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


    // New customers trend (last 7 days)
    const newCustomersTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart)
      date.setDate(date.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await prisma.customer.count({
        where: { createdAt: { gte: date, lt: nextDate } },
      })

      newCustomersTrend.push({
        date: date.toISOString().split('T')[0],
        customers: count,
      })
    }

    // Total revenue (last 30 days)
    const totalRevenue30Days = await prisma.order.aggregate({
      where: {
        createdAt: { gte: last30DaysStart },
        paymentStatus: 'PAID',
      },
      _sum: { totalAmount: true },
    })

    // Total orders (last 30 days)
    const totalOrders30Days = await prisma.order.count({
      where: { createdAt: { gte: last30DaysStart } },
    })

    return {
      stats: {
        ordersToday: { value: ordersToday, change: ordersChange },
        revenueToday: { value: Number(revenueToday._sum.totalAmount || 0), change: revenueChange },
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
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return empty/default data on error
    return {
      stats: {
        ordersToday: { value: 0, change: '0' },
        revenueToday: { value: 0, change: '0' },
        totalProducts: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        totalRevenue30Days: 0,
        totalOrders30Days: 0,
      },
      charts: {
        revenueTrend: [],
        orderTrend: [],
        orderStatusDistribution: [],
        paymentStatusDistribution: [],
        topProducts: [],
        salesByCategory: [],
        newCustomersTrend: [],
      },
    }
  }
}

export default function AdminHomePage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardData />
    </Suspense>
  )
}
