import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'

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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  
  if (!session?.user?.email) {
    redirect('/auth/login?callbackUrl=/account/orders')
  }

  const customer = await getCustomerData(session.user.email)
  
  if (!customer) {
    redirect('/account/orders')
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!order || order.customerId !== customer.id) {
    notFound()
  }

  const mapLink = order.customerCoordinates 
    ? `https://www.google.com/maps?q=${(order.customerCoordinates as { lat: number; lng: number }).lat},${(order.customerCoordinates as { lat: number; lng: number }).lng}`
    : null

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <Link 
        href="/account/orders"
        className="inline-flex items-center gap-2 text-[#030e55] hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tsf-font-sora mb-2">Order #{order.orderNumber}</h1>
        <p className="text-gray-600">
          Order placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    {item.productImageUrl && (
                      <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.productImageUrl}
                          alt={item.productName}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>
                      {item.variationName && (
                        <p className="text-sm text-gray-600 mb-2">Variation: {item.variationName}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × Rs. {Number(item.unitPrice).toFixed(2)}
                      </p>
                      {Number(item.discountAmount) > 0 && (
                        <p className="text-sm text-green-600">
                          Discount: -Rs. {Number(item.discountAmount).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        Rs. {Number(item.totalPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Status History</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.statusHistory.map((history, index) => (
                    <div key={history.id} className="flex items-start gap-4">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{history.status}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(history.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {history.notes && (
                          <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-lg p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">Rs. {Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-Rs. {Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              {Number(order.deliveryFee) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-gray-900">Rs. {Number(order.deliveryFee).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-300">
                <span className="text-gray-900">Total</span>
                <span className="text-[#030e55]">Rs. {Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-300">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Status</p>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                  order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                <p className="text-sm text-gray-600">{order.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Order Status</p>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Details</h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900">{order.customerName}</p>
            <p className="text-gray-600">{order.customerEmail}</p>
            {order.customerPhone && (
              <p className="text-gray-600">
                <a href={`tel:${order.customerPhone}`} className="text-[#030e55] hover:underline">
                  {order.customerPhone}
                </a>
              </p>
            )}
            {order.customerAlternativePhone && (
              <p className="text-gray-600">
                <a href={`tel:${order.customerAlternativePhone}`} className="text-[#030e55] hover:underline">
                  Alt: {order.customerAlternativePhone}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Details</h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900">{order.customerName}</p>
            {order.customerAddress && (
              <p className="text-gray-600">{order.customerAddress}</p>
            )}
            {order.customerCity && (
              <p className="text-gray-600">{order.customerCity}</p>
            )}
            {order.customerLandmark && (
              <p className="text-gray-600">Landmark: {order.customerLandmark}</p>
            )}
            {mapLink && (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#030e55] hover:underline mt-2"
              >
                <MapPin className="h-4 w-4" />
                View on Map
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

