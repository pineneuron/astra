'use client'

import { useMemo, useState } from 'react'
import { Search, MoreVertical, Eye, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Toast from '@radix-ui/react-toast'
import { CheckCircle2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import OrderModal from './OrderModal'

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
  q: string
  orders: UIOrder[]
}

export default function OrdersClient({ q, orders }: Props) {
  const [open, setOpen] = useState(false)
  const [viewing, setViewing] = useState<UIOrder | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const sort = params.get('sort') || ''
  const dir = (params.get('dir') === 'asc') ? 'asc' : (params.get('dir') === 'desc' ? 'desc' : undefined)

  function toggleSort(field: 'orderNumber' | 'customerName' | 'customerEmail' | 'totalAmount' | 'status' | 'paymentStatus' | 'createdAt') {
    const currentSort = params.get('sort')
    const currentDir = params.get('dir') === 'desc' ? 'desc' : 'asc'
    const nextDir = currentSort === field && currentDir === 'asc' ? 'desc' : 'asc'
    const sp = new URLSearchParams(params.toString())
    sp.set('sort', field)
    sp.set('dir', nextDir)
    router.replace(`${pathname}?${sp.toString()}`)
  }

  const rows = useMemo(() => orders, [orders])

  function getStatusColor(status: string) {
    const statusMap: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PROCESSING: 'bg-purple-100 text-purple-700',
      SHIPPED: 'bg-indigo-100 text-indigo-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-700',
    }
    return statusMap[status] || 'bg-gray-100 text-gray-700'
  }

  function getPaymentStatusColor(status: string) {
    const statusMap: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PAID: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-700',
    }
    return statusMap[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-gray-900">Orders</h1>
          <p className="text-[12px] text-gray-400">Manage orders</p>
        </div>
        <div className="flex items-center gap-2">
          <form className="hidden md:flex items-center relative" method="get">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search orders..."
              className="h-9 w-64 pl-8 pr-3 border border-[oklch(.922_0_0)] rounded-md text-sm"
            />
          </form>
        </div>
      </div>

      <div className="rounded-lg border border-[oklch(.922_0_0)] bg-white overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b border-b-[oklch(.922_0_0)] text-left text-xs uppercase text-gray-500">
              <th className="px-3 py-2 w-32">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('orderNumber')}>
                  <span>Order #</span>
                  {sort === 'orderNumber' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-40">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('customerName')}>
                  <span>Customer</span>
                  {sort === 'customerName' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-40">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('customerEmail')}>
                  <span>Email</span>
                  {sort === 'customerEmail' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-40">
                <span>Phone</span>
              </th>
              <th className="px-3 py-2 w-28">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('totalAmount')}>
                  <span>Total</span>
                  {sort === 'totalAmount' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-32">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('status')}>
                  <span>Status</span>
                  {sort === 'status' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-32">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('paymentStatus')}>
                  <span>Payment</span>
                  {sort === 'paymentStatus' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-36">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('createdAt')}>
                  <span>Date</span>
                  {sort === 'createdAt' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[oklch(.922_0_0)]">
            {rows.map(order => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-3 py-3 text-[13px] font-mono font-medium">{order.orderNumber}</td>
                <td className="px-3 py-3 text-[13px]">{order.customerName}</td>
                <td className="px-3 py-3 text-[13px] text-gray-600">{order.customerEmail}</td>
                <td className="px-3 py-3 text-[13px] text-gray-700">
                  {order.customerPhone && (
                    <div>
                      <a href={`tel:${order.customerPhone}`} className="text-[#030e55] hover:underline">{order.customerPhone}</a>
                    </div>
                  )}
                  {order.customerAlternativePhone && (
                    <div className="text-[12px] text-gray-500 mt-1">
                      <span className="text-gray-400">Alt:</span> <a href={`tel:${order.customerAlternativePhone}`} className="text-[#030e55] hover:underline">{order.customerAlternativePhone}</a>
                    </div>
                  )}
                  {!order.customerPhone && !order.customerAlternativePhone && (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-3 py-3 text-[13px] font-semibold">Rs. {order.totalAmount.toFixed(2)}</td>
                <td className="px-3 py-3">
                  <span className={`px-2.5 h-6 inline-flex items-center rounded-md text-[11px] font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2.5 h-6 inline-flex items-center rounded-md text-[11px] font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-3 py-3 text-[12px] text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-3 text-right">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-50">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content side="bottom" align="end" sideOffset={6} className="z-50 min-w-[180px] rounded-md bg-white p-2 shadow-md">
                        <div className="px-2 pb-2 text-[13px] font-semibold text-gray-900">Actions</div>
                        <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                          <button
                            type="button"
                            onClick={() => {
                              setViewing(order)
                              setOpen(true)
                            }}
                            className="flex items-center gap-2 w-full text-left"
                          >
                            <Eye className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                            <span>View Details</span>
                          </button>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          {q ? 'No orders found matching your search.' : 'No orders yet.'}
        </div>
      )}

      <OrderModal isOpen={open} onClose={() => { setOpen(false); setViewing(null) }} order={viewing ?? undefined} onSuccess={(m) => { setToastMsg(m); setToastOpen(true); router.refresh() }} />

      <Toast.Provider swipeDirection="right">
        <Toast.Root open={toastOpen} onOpenChange={setToastOpen} className="fixed top-6 right-6 z-[60] rounded-md bg-white border border-[oklch(.922_0_0)] shadow px-4 py-3 text-[13px] w-[320px] max-w-[92vw]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <Toast.Title className="font-semibold text-gray-900">Success</Toast.Title>
          </div>
          <Toast.Description className="mt-1 text-gray-700">{toastMsg}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0 right-0 flex flex-col p-6 gap-2 w-[320px] max-w-[100vw] m-0 list-none z-[60] outline-none" />
      </Toast.Provider>
    </div>
  )
}
