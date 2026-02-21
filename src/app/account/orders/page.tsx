import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getCustomerData(email: string) {
  let customer = await prisma.customer.findUnique({
    where: { email }
  })

  if (!customer) {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
      if (user && user.name) {
        customer = await prisma.customer.create({
          data: {
            name: user.name,
            email: user.email!,
          }
        })
      }
  }

  return customer
}

export default async function AccountOrders() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login?callbackUrl=/account/orders')
  }

  const customer = await getCustomerData(session.user.email)
  
  if (!customer) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold tsf-font-sora mb-4">Orders</h1>
        <p className="text-gray-600">Unable to load orders.</p>
      </div>
    )
  }

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: {
      items: {
        take: 3
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold tsf-font-sora mb-6">Orders</h1>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-semibold text-gray-900">
                      Rs. {Number(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-2 tsf-bg-blue text-white rounded-full px-4 py-2 text-sm font-semibold hover:opacity-90"
                    >
                      <Eye className="h-4 w-4" />
                      View Order
                    </Link>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {item.productImageUrl && (
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.productImageUrl}
                            alt={item.productName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        {item.variationName && (
                          <p className="text-sm text-gray-600">Variation: {item.variationName}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × Rs. {Number(item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          Rs. {Number(item.totalPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-gray-600 text-center pt-2">
                      + {order.items.length - 3} more item(s)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900 mb-2">No orders yet</p>
          <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="inline-block tsf-bg-blue text-white rounded-full px-8 py-3 text-sm font-semibold hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  )
}

