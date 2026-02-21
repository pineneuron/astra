import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ShoppingBag, Package, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getCustomerData(email: string) {
  // Get or create customer by email
  let customer = await prisma.customer.findUnique({
    where: { email },
    include: {
      addresses: {
        where: { isDefault: true },
        take: 1
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  // If customer doesn't exist, create one from user data
  if (!customer) {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
      if (user && user.name) {
        customer = await prisma.customer.create({
          data: {
            name: user.name,
            email: user.email!,
          },
        include: {
          addresses: true,
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      })
    }
  }

  return customer
}

export default async function AccountDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login?callbackUrl=/account')
  }

  const customer = await getCustomerData(session.user.email)
  
  if (!customer) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold tsf-font-sora mb-4">Dashboard</h1>
        <p className="text-gray-600">Unable to load account information.</p>
      </div>
    )
  }

  // Get order statistics
  const allOrders = await prisma.order.findMany({
    where: { customerId: customer.id },
    select: {
      status: true,
      paymentStatus: true
    }
  })

  const pendingOrders = allOrders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING').length
  const completedOrders = allOrders.filter(o => o.status === 'DELIVERED').length
  const totalOrders = allOrders.length

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold tsf-font-sora mb-6">Dashboard</h1>
      
      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-2">
          Hello <strong>{customer.name || customer.email}</strong>,
        </p>
        <p className="text-gray-600">
          From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
            <ShoppingBag className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Pending Orders</h3>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Completed Orders</h3>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{completedOrders}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Recent Orders</h2>
          <Link 
            href="/account/orders"
            className="text-[#030e55] hover:underline text-sm font-medium"
          >
            View all orders →
          </Link>
        </div>

        {customer.orders && customer.orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customer.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Link 
                        href={`/account/orders/${order.id}`}
                        className="text-[#030e55] hover:underline font-medium"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      Rs. {Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-[#030e55] hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No orders yet</p>
            <Link
              href="/products"
              className="inline-block tsf-bg-blue text-white rounded-full px-6 py-2 text-sm font-semibold hover:opacity-90"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>

      {/* Default Address */}
      {customer.addresses && customer.addresses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Default Address</h2>
            <Link 
              href="/account/addresses"
              className="text-[#030e55] hover:underline text-sm font-medium"
            >
              Manage addresses →
            </Link>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="font-semibold text-gray-900 mb-2">{customer.addresses[0].name}</p>
            <p className="text-gray-600 text-sm">
              {customer.addresses[0].address}
              <br />
              {customer.addresses[0].city}
              {customer.addresses[0].landmark && `, ${customer.addresses[0].landmark}`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
