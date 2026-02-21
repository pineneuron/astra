'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'

type UIOrderItem = {
  id: string
  productId: string
  productName: string
  productImageUrl: string | null
  variationName: string | null
  quantity: number
  unitPrice: number
  discountAmount: number
  totalPrice: number
}

type UIOrder = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  customerAlternativePhone: string | null
  customerCity: string | null
  customerAddress: string | null
  customerLandmark: string | null
  customerCoordinates: { lat: number; lng: number } | null
  customerNotes: string | null
  paymentScreenshot: string | null
  subtotal: number
  deliveryFee: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  status: string
  paymentStatus: string
  paymentMethod: string | null
  paymentReference: string | null
  deliveryDate: string | null
  deliveryTimeSlot: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  items: UIOrderItem[]
}

type Props = {
  isOpen: boolean
  onClose: () => void
  order?: UIOrder
  onSuccess?: (message: string) => void
}

export default function OrderModal({ isOpen, onClose, order, onSuccess }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState('PENDING')
  const [paymentStatus, setPaymentStatus] = useState('PENDING')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (order) {
      setStatus(order.status)
      setPaymentStatus(order.paymentStatus)
      setNotes(order.notes || '')
    }
    setFormError('')
  }, [order, isOpen])

  const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
  const paymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']

  if (!order) return null

  const mapLink = order.customerCoordinates
    ? `https://www.google.com/maps?q=${order.customerCoordinates.lat},${order.customerCoordinates.lng}`
    : null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[90vh] overflow-y-auto thin-scrollbar">
          <div className="flex items-center justify-between px-4 py-3 border-b border-b-[oklch(.922_0_0)] sticky top-0 bg-white z-10">
            <Dialog.Title className="text-xl font-semibold">Order #{order.orderNumber}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">×</button>
            </Dialog.Close>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setFormError('')
              setSubmitting(true)
              
              // Explicitly get form values to ensure they're included
              const fd = new FormData()
              fd.append('id', order.id)
              fd.append('status', status)
              fd.append('paymentStatus', paymentStatus)
              fd.append('notes', notes)
              
              try {
                const res = await fetch('/admin/orders/actions/update', { method: 'POST', body: fd })
                if (!res.ok) {
                  const msg = (await res.text()) || 'Failed to update order'
                  throw new Error(msg)
                }
                const data = await res.json()
                if (!data.ok) {
                  throw new Error(data.error || 'Failed to update order')
                }
                onSuccess?.('Order updated successfully')
                onClose()
                // Refresh the page data
                router.refresh()
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to update order'
                setFormError(msg)
                console.error('Update order error:', err)
              } finally {
                setSubmitting(false)
              }
            }}
            className="p-4 space-y-6"
          >
            {formError && (
              <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-[13px]">{formError}</div>
            )}

            {/* Customer Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-md">
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Name</label>
                  <p className="text-[13px] font-medium text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Email</label>
                  <p className="text-[13px] font-medium text-gray-900">
                    <a href={`mailto:${order.customerEmail}`} className="text-[#030e55] underline">{order.customerEmail}</a>
                  </p>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Phone</label>
                  <p className="text-[13px] font-medium text-gray-900">
                    <a href={`tel:${order.customerPhone}`} className="text-[#030e55] underline">{order.customerPhone || '-'}</a>
                  </p>
                </div>
                {order.customerAlternativePhone && (
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1">Alternative Phone</label>
                    <p className="text-[13px] font-medium text-gray-900">
                      <a href={`tel:${order.customerAlternativePhone}`} className="text-[#030e55] underline">{order.customerAlternativePhone}</a>
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">City</label>
                  <p className="text-[13px] font-medium text-gray-900">{order.customerCity || '-'}</p>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Address</label>
                  <p className="text-[13px] font-medium text-gray-900">{order.customerAddress || '-'}</p>
                </div>
                {order.customerLandmark && (
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1">Landmark</label>
                    <p className="text-[13px] font-medium text-gray-900">{order.customerLandmark}</p>
                  </div>
                )}
                {mapLink && (
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1">Map</label>
                    <p className="text-[13px] font-medium">
                      <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-[#030e55] underline">View on Google Maps</a>
                    </p>
                  </div>
                )}
                {order.customerNotes && (
                  <div className="md:col-span-2">
                    <label className="block text-[12px] text-gray-600 mb-1">Customer Notes</label>
                    <p className="text-[13px] text-gray-900">{order.customerNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="border border-[oklch(.922_0_0)] rounded-md overflow-hidden">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-b-[oklch(.922_0_0)] text-left text-xs uppercase text-gray-500">
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2 text-center w-20">Qty</th>
                      <th className="px-3 py-2 text-right w-24">Price</th>
                      <th className="px-3 py-2 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[oklch(.922_0_0)]">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            {item.productImageUrl && (
                              <Image
                                src={item.productImageUrl}
                                alt={item.productName}
                                width={50}
                                height={50}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="text-[13px] font-medium text-gray-900">{item.productName}</p>
                              {item.variationName && (
                                <p className="text-[11px] text-gray-500">{item.variationName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-[13px] text-gray-700">{item.quantity}</td>
                        <td className="px-3 py-3 text-right text-[13px] text-gray-700">Rs. {item.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right text-[13px] font-semibold text-gray-900">Rs. {item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-medium">Rs. {order.subtotal.toFixed(2)}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900 font-medium">Rs. {order.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600 font-medium">-Rs. {order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900 font-medium">Rs. {order.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[15px] font-semibold pt-2 border-t border-gray-300">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#030e55]">Rs. {order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-900 font-medium">{order.paymentMethod || '-'}</span>
                </div>
                {order.paymentReference && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-600">Payment Reference</span>
                    <span className="text-gray-900 font-medium">{order.paymentReference}</span>
                  </div>
                )}
                {order.paymentScreenshot && (
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-2">Payment Screenshot</label>
                    <a href={order.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-[#030e55] underline text-[13px]">View Screenshot</a>
                    <div className="mt-2">
                      <Image
                        src={order.paymentScreenshot}
                        alt="Payment Screenshot"
                        width={300}
                        height={300}
                        className="max-w-full h-auto rounded-md border border-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status and Payment Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Order Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 pr-8 text-[13px] appearance-none"
                  >
                    {orderStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4 text-gray-500">
                      <path fillRule="evenodd" d="M10 12a1 1 0 0 1-.7-.29l-4-4a1 1 0 1 1 1.4-1.42L10 9.59l3.3-3.3a1 1 0 0 1 1.4 1.42l-4 4A1 1 0 0 1 10 12Z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Payment Status</label>
                <div className="relative">
                  <select
                    name="paymentStatus"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 pr-8 text-[13px] appearance-none"
                  >
                    {paymentStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4 text-gray-500">
                      <path fillRule="evenodd" d="M10 12a1 1 0 0 1-.7-.29l-4-4a1 1 0 1 1 1.4-1.42L10 9.59l3.3-3.3a1 1 0 0 1 1.4 1.42l-4 4A1 1 0 0 1 10 12Z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-[12px] text-gray-600 mb-1">Admin Notes</label>
              <textarea
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-24 w-full border border-[oklch(.922_0_0)] rounded-md px-3 py-2 text-[13px]"
                placeholder="Add internal notes about this order..."
              />
            </div>

            {/* Order Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] text-gray-600">
              <div>
                <span className="font-semibold">Created:</span> {new Date(order.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">Last Updated:</span> {new Date(order.updatedAt).toLocaleString()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[oklch(.922_0_0)]">
              <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-[13px]">Close</button>
              <button type="submit" disabled={submitting} className="h-9 px-4 rounded-md bg-[#030e55] text-white text-[13px] font-semibold disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

