'use client'

import { useMemo, useState } from 'react'
import { Search, MoreVertical, Eye, Trash2, ArrowUpDown, ChevronUp, ChevronDown, CheckCircle2, XCircle } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import * as Toast from '@radix-ui/react-toast'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import BookingModal from './BookingModal'

type UIBooking = {
  id: string
  bookingNumber: string
  serviceId: string
  serviceTitle: string
  fullName: string
  email: string
  phone: string
  gender: string
  dateOfBirth: string
  timeOfBirth: string
  placeOfBirth: string
  amount: number
  currency: string
  status: string
  paymentScreenshot: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

type Props = {
  q: string
  bookings: UIBooking[]
  actions?: {
    deleteBooking: (fd: FormData) => Promise<void>
  }
}

export default function BookingsClient({ q, bookings, actions }: Props) {
  const [open, setOpen] = useState(false)
  const [viewing, setViewing] = useState<UIBooking | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UIBooking | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastError, setToastError] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const sort = params.get('sort') || ''
  const dir = (params.get('dir') === 'asc') ? 'asc' : (params.get('dir') === 'desc' ? 'desc' : undefined)

  function toggleSort(field: 'bookingNumber' | 'fullName' | 'email' | 'amount' | 'status' | 'createdAt') {
    const currentSort = params.get('sort')
    const currentDir = params.get('dir') === 'desc' ? 'desc' : 'asc'
    const nextDir = currentSort === field && currentDir === 'asc' ? 'desc' : 'asc'
    const sp = new URLSearchParams(params.toString())
    sp.set('sort', field)
    sp.set('dir', nextDir)
    router.replace(`${pathname}?${sp.toString()}`)
  }

  const rows = useMemo(() => bookings, [bookings])

  function getStatusColor(status: string) {
    const statusMap: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PAID: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    }
    return statusMap[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-gray-900">Bookings</h1>
          <p className="text-[12px] text-gray-400">Manage service bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <form className="hidden md:flex items-center relative" method="get">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search bookings..."
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
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('bookingNumber')}>
                  <span>Booking #</span>
                  {sort === 'bookingNumber' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-40">
                <span>Service</span>
              </th>
              <th className="px-3 py-2 w-36">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('fullName')}>
                  <span>Customer</span>
                  {sort === 'fullName' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-40">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('email')}>
                  <span>Email</span>
                  {sort === 'email' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-36">
                <span>Phone</span>
              </th>
              <th className="px-3 py-2 w-28">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('amount')}>
                  <span>Amount</span>
                  {sort === 'amount' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-32">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('status')}>
                  <span>Status</span>
                  {sort === 'status' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
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
            {rows.map(booking => (
              <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-3 py-3 text-[13px] font-mono font-medium">{booking.bookingNumber}</td>
                <td className="px-3 py-3 text-[13px]">{booking.serviceTitle}</td>
                <td className="px-3 py-3 text-[13px]">{booking.fullName}</td>
                <td className="px-3 py-3 text-[13px] text-gray-600">{booking.email}</td>
                <td className="px-3 py-3 text-[13px] text-gray-700">
                  <a href={`tel:${booking.phone}`} className="text-[#030e55] hover:underline">{booking.phone}</a>
                </td>
                <td className="px-3 py-3 text-[13px] font-semibold">{booking.currency} {booking.amount.toFixed(2)}</td>
                <td className="px-3 py-3">
                  <span className={`px-2.5 h-6 inline-flex items-center rounded-md text-[11px] font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-[12px] text-gray-600">{new Date(booking.createdAt).toLocaleDateString()}</td>
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
                              setViewing(booking)
                              setOpen(true)
                            }}
                            className="flex items-center gap-2 w-full text-left"
                          >
                            <Eye className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                            <span>View Details</span>
                          </button>
                        </DropdownMenu.Item>
                        {actions?.deleteBooking && (
                          <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                            <button
                              type="button"
                              onClick={() => setPendingDelete(booking)}
                              className="flex items-center gap-2 w-full text-left text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </DropdownMenu.Item>
                        )}
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
          {q ? 'No bookings found matching your search.' : 'No bookings yet.'}
        </div>
      )}

      <BookingModal isOpen={open} onClose={() => { setOpen(false); setViewing(null) }} booking={viewing ?? undefined} onSuccess={(m) => { setToastMsg(m); setToastOpen(true); setToastError(false); router.refresh() }} />

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => { if (!o) setPendingDelete(null) }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-xl focus:outline-none">
            <AlertDialog.Title className="text-[15px] font-semibold">Delete booking?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-[13px] text-gray-600">
              This will permanently delete booking {pendingDelete?.bookingNumber}. This action cannot be undone.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  className="h-9 px-4 rounded-md bg-red-600 text-white text-[13px] font-semibold"
                  onClick={async () => {
                    if (pendingDelete && actions?.deleteBooking) {
                      const fd = new FormData()
                      fd.append('id', pendingDelete.id)
                      try {
                        await actions.deleteBooking(fd)
                        setPendingDelete(null)
                        setToastMsg('Booking deleted')
                        setToastError(false)
                        setToastOpen(true)
                        router.refresh()
                      } catch (error) {
                        setPendingDelete(null)
                        setToastMsg(error instanceof Error ? error.message : 'Failed to delete booking')
                        setToastError(true)
                        setToastOpen(true)
                      }
                    }
                  }}
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Toast.Provider swipeDirection="right">
        <Toast.Root open={toastOpen} onOpenChange={setToastOpen} className={`fixed top-6 right-6 z-[60] rounded-md bg-white border shadow px-4 py-3 text-[13px] w-[320px] max-w-[92vw] ${toastError ? 'border-red-200 bg-red-50' : 'border-[oklch(.922_0_0)]'}`}>
          <div className="flex items-center gap-2">
            {toastError ? <XCircle className="h-4 w-4 text-red-600" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}
            <Toast.Title className="font-semibold text-gray-900">{toastError ? 'Error' : 'Success'}</Toast.Title>
          </div>
          <Toast.Description className="mt-1 text-gray-700">{toastMsg}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0 right-0 flex flex-col p-6 gap-2 w-[320px] max-w-[100vw] m-0 list-none z-[60] outline-none" />
      </Toast.Provider>
    </div>
  )
}
