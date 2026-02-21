'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package, CheckCircle2, Clock, XCircle, Truck, MapPin, Calendar, Phone, Mail } from 'lucide-react'

type OrderItem = {
  id: string
  productName: string
  productImageUrl: string | null
  variationName: string | null
  quantity: number
  unitPrice: number
  discountAmount: number
  totalPrice: number
}

type StatusHistory = {
  id: string
  status: string
  notes: string | null
  createdAt: string
}

type Order = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  customerCity: string | null
  customerAddress: string | null
  customerLandmark: string | null
  subtotal: number
  deliveryFee: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  status: string
  paymentStatus: string
  paymentMethod: string | null
  deliveryDate: string | null
  deliveryTimeSlot: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  statusHistory: StatusHistory[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800'
    case 'PROCESSING':
      return 'bg-purple-100 text-purple-800'
    case 'SHIPPED':
      return 'bg-indigo-100 text-indigo-800'
    case 'DELIVERED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    case 'REFUNDED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    case 'REFUNDED':
      return 'bg-gray-100 text-gray-800'
    case 'PARTIALLY_REFUNDED':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return <CheckCircle2 className="h-5 w-5" />
    case 'CANCELLED':
      return <XCircle className="h-5 w-5" />
    case 'SHIPPED':
      return <Truck className="h-5 w-5" />
    default:
      return <Clock className="h-5 w-5" />
  }
}

export default function TrackOrderContent() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderNumber.trim() && !email.trim()) {
      setError('Please enter order number or email')
      return
    }

    setLoading(true)
    setError('')
    setOrders([])

    try {
      const params = new URLSearchParams()
      if (orderNumber.trim()) params.append('orderNumber', orderNumber.trim())
      if (email.trim()) params.append('email', email.trim())

      const response = await fetch(`/api/orders/track?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch orders')
        return
      }

      if (data.orders.length === 0) {
        setError('No orders found with the provided information')
        return
      }

      setOrders(data.orders)
    } catch (err) {
      setError('An error occurred while fetching orders')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <>
      <div className="tsf-breadcrumb relative py-20">
        <div className="w-full mx-auto 2xl:container">
          <div className="tsf-breadcrumb-content absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-white text-align-center text-4xl font-bold tsf-font-sora capitalize">Track Your Order</h1>
          </div>
        </div>
      </div>

      <div className="tsf-our-product py-20">
        <div className="container px-4 md:px-6 lg:px-7 mx-auto">
          <div className="w-full max-w-lg mx-auto">
            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
              <h1 className="text-4xl font-bold mb-8 text-center">Track Your Order</h1>
              {error && <div className="bg-red-100 text-red-700 rounded p-2 mb-4 text-center">{error}</div>}
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="peer w-full border rounded-lg px-4 py-4 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all"
                    placeholder="Order Number"
                  />
                  <label
                    htmlFor="orderNumber"
                    className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
                      text-gray-400 text-base top-4
                      peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
                      peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
                      peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                  >
                    Order Number
                  </label>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-md">OR</span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer w-full border rounded-lg px-4 py-4 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all"
                    placeholder="Email"
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
                      text-gray-400 text-base top-4
                      peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
                      peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
                      peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                  >
                    Email Address
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-[#030e55] text-white rounded font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? "Searching..." : "Track Order"}
                </button>
              </form>
            </div>

            {/* Orders List */}
            {orders.length > 0 && (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold tsf-font-sora">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="p-6 space-y-6">
                      {/* Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Customer Information
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Name:</strong> {order.customerName}</p>
                            <p><strong>Email:</strong> {order.customerEmail}</p>
                            {order.customerPhone && (
                              <p className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <strong>Phone:</strong> {order.customerPhone}
                              </p>
                            )}
                          </div>
                        </div>
                        {(order.customerAddress || order.customerCity) && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Delivery Address
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              {order.customerAddress && <p>{order.customerAddress}</p>}
                              {order.customerLandmark && <p className="text-gray-500">Landmark: {order.customerLandmark}</p>}
                              {order.customerCity && <p>{order.customerCity}</p>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delivery Info */}
                      {(order.deliveryDate || order.deliveryTimeSlot) && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Delivery Information
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            {order.deliveryDate && (
                              <p><strong>Date:</strong> {formatDate(order.deliveryDate)}</p>
                            )}
                            {order.deliveryTimeSlot && (
                              <p><strong>Time Slot:</strong> {order.deliveryTimeSlot}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Order Items
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-md">
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
                                <h5 className="font-medium">{item.productName}</h5>
                                {item.variationName && (
                                  <p className="text-sm text-gray-600">Variation: {item.variationName}</p>
                                )}
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                                {item.discountAmount > 0 && (
                                  <p className="text-xs text-gray-500 line-through">
                                    {formatCurrency(item.unitPrice * item.quantity)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="border-t pt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-{formatCurrency(order.discountAmount)}</span>
                            </div>
                          )}
                          {order.deliveryFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Delivery Fee:</span>
                              <span className="font-medium">{formatCurrency(order.deliveryFee)}</span>
                            </div>
                          )}
                          {order.taxAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax:</span>
                              <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status History */}
                      {order.statusHistory.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Order Status History</h4>
                          <div className="space-y-2">
                            {order.statusHistory.map((history) => (
                              <div key={history.id} className="flex gap-3 text-sm">
                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#030e55] mt-2"></div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(history.status)}`}>
                                      {history.status}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {formatDate(history.createdAt)}
                                    </span>
                                  </div>
                                  {history.notes && (
                                    <p className="text-gray-600 mt-1">{history.notes}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  )
}

