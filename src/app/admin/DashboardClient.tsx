'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import Link from 'next/link'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface DashboardClientProps {
  stats: {
    ordersToday: { value: number; change: string }
    revenueToday: { value: number; change: string }
    totalProducts: number
    totalCustomers: number
    avgOrderValue: number
    pendingOrders: number
    lowStockItems: number
    totalRevenue30Days: number
    totalOrders30Days: number
  }
  charts: {
    revenueTrend: Array<{ date: string; revenue: number }>
    orderTrend: Array<{ date: string; orders: number }>
    orderStatusDistribution: Array<{ status: string; count: number }>
    paymentStatusDistribution: Array<{ status: string; count: number }>
    topProducts: Array<{ name: string; quantity: number; revenue: number }>
    salesByCategory: Array<{ name: string; revenue: number }>
    newCustomersTrend: Array<{ date: string; customers: number }>
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardClient({ stats, charts }: DashboardClientProps) {
  const isPositiveChange = (change: string) => parseFloat(change) >= 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Orders (Today)</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900">
                {stats.ordersToday.value}
              </div>
            </div>
            <div className={`text-sm font-medium ${isPositiveChange(stats.ordersToday.change)
                ? 'text-green-600'
                : 'text-red-600'
              }`}>
              {isPositiveChange(stats.ordersToday.change) ? '+' : ''}
              {stats.ordersToday.change}%
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">vs yesterday</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Revenue (Today)</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900">
                {formatCurrency(stats.revenueToday.value)}
              </div>
            </div>
            <div className={`text-sm font-medium ${isPositiveChange(stats.revenueToday.change)
                ? 'text-green-600'
                : 'text-red-600'
              }`}>
              {isPositiveChange(stats.revenueToday.change) ? '+' : ''}
              {stats.revenueToday.change}%
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">vs yesterday</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Products</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900">
                {stats.totalProducts}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Active products</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Customers</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900">
                {stats.totalCustomers}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Total customers</div>
        </div>
      </div>

      {/* Additional Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Avg Order Value</div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">
            {formatCurrency(stats.avgOrderValue)}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Pending Orders</div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">
            {stats.pendingOrders}
          </div>
          {stats.pendingOrders > 0 && (
            <Link
              href="/admin/orders?status=PENDING"
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              View all →
            </Link>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Low Stock Items</div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">
            {stats.lowStockItems}
          </div>
          {stats.lowStockItems > 0 && (
            <div className="mt-2 text-xs text-red-600">Action required</div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Revenue (30 Days)</div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">
            {formatCurrency(stats.totalRevenue30Days)}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.totalOrders30Days} orders
          </div>
        </div>
      </div>

      {/* Charts Row 1: Revenue & Order Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}k`}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={formatDate}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Volume (7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.orderTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                style={{ fontSize: '12px' }}
              />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip labelFormatter={formatDate} />
              <Legend />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Order Status & Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.orderStatusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: PieLabelRenderProps) => {
                  const entry = props as PieLabelRenderProps & { status: string }
                  const percent = typeof props.percent === 'number' ? props.percent : 0
                  return `${entry.status}: ${(percent * 100).toFixed(0)}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {charts.orderStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.paymentStatusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: PieLabelRenderProps) => {
                  const entry = props as PieLabelRenderProps & { status: string }
                  const percent = typeof props.percent === 'number' ? props.percent : 0
                  return `${entry.status}: ${(percent * 100).toFixed(0)}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {charts.paymentStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3: Top Products & Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products (30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={charts.topProducts.slice(0, 8)}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" style={{ fontSize: '12px' }} />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                style={{ fontSize: '12px' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey="quantity" fill="#3b82f6" name="Quantity Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category (30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.salesByCategory.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}k`}
                style={{ fontSize: '12px' }}
              />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Customers Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New Customers (7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={charts.newCustomersTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              style={{ fontSize: '12px' }}
            />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip labelFormatter={formatDate} />
            <Legend />
            <Bar dataKey="customers" fill="#8b5cf6" name="New Customers" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
