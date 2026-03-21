'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'

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
  isOpen: boolean
  onClose: () => void
  booking?: UIBooking
  onSuccess?: (message: string) => void
}

export default function BookingModal({ isOpen, onClose, booking, onSuccess }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState('PENDING')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (booking) {
      setStatus(booking.status)
      setNotes(booking.notes || '')
    }
    setFormError('')
  }, [booking, isOpen])

  const bookingStatuses = ['PENDING', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED']

  if (!booking) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[90vh] overflow-y-auto thin-scrollbar">
          <div className="flex items-center justify-between px-4 py-3 border-b border-b-[oklch(.922_0_0)] sticky top-0 bg-white z-10">
            <Dialog.Title className="text-xl font-semibold">Booking #{booking.bookingNumber}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">×</button>
            </Dialog.Close>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setFormError('')
              setSubmitting(true)

              const fd = new FormData()
              fd.append('id', booking.id)
              fd.append('status', status)
              fd.append('notes', notes)

              try {
                const res = await fetch('/admin/bookings/actions/update', { method: 'POST', body: fd })
                if (!res.ok) {
                  const msg = (await res.text()) || 'Failed to update booking'
                  throw new Error(msg)
                }
                const data = await res.json()
                if (!data.ok) {
                  throw new Error(data.error || 'Failed to update booking')
                }
                onSuccess?.('Booking updated successfully')
                onClose()
                router.refresh()
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to update booking'
                setFormError(msg)
                console.error('Update booking error:', err)
              } finally {
                setSubmitting(false)
              }
            }}
            className="p-4 space-y-6"
          >
            {formError && (
              <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-[13px]">{formError}</div>
            )}

            {/* Service & Amount */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Service & Amount</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-md">
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Service</label>
                  <p className="text-[13px] font-medium text-gray-900">{booking.serviceTitle}</p>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Amount</label>
                  <p className="text-[13px] font-semibold text-gray-900">{booking.currency} {booking.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Customer & Birth Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer & Birth Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-md">
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Name</label>
                  <p className="text-[13px] font-medium text-gray-900">{booking.fullName}</p>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Email</label>
                  <p className="text-[13px] font-medium text-gray-900">
                    <a href={`mailto:${booking.email}`} className="text-[#030e55] underline">{booking.email}</a>
                  </p>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Phone</label>
                  <p className="text-[13px] font-medium text-gray-900">
                    <a href={`tel:${booking.phone}`} className="text-[#030e55] underline">{booking.phone}</a>
                  </p>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Gender</label>
                  <p className="text-[13px] font-medium text-gray-900 capitalize">{booking.gender}</p>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Date of Birth</label>
                  <p className="text-[13px] font-medium text-gray-900">{booking.dateOfBirth}</p>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Time of Birth</label>
                  <p className="text-[13px] font-medium text-gray-900">{booking.timeOfBirth}</p>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Place of Birth</label>
                  <p className="text-[13px] font-medium text-gray-900">{booking.placeOfBirth}</p>
                </div>
              </div>
            </div>

            {/* Payment Screenshot */}
            {booking.paymentScreenshot && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Screenshot</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <a href={booking.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-[#030e55] underline text-[13px]">View Screenshot</a>
                  <div className="mt-2">
                    <Image
                      src={booking.paymentScreenshot}
                      alt="Payment Screenshot"
                      width={300}
                      height={300}
                      className="max-w-full h-auto rounded-md border border-gray-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-[12px] text-gray-600 mb-1">Booking Status</label>
              <div className="relative">
                <select
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 pr-8 text-[13px] appearance-none"
                >
                  {bookingStatuses.map((s) => (
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

            {/* Admin Notes */}
            <div>
              <label className="block text-[12px] text-gray-600 mb-1">Admin Notes</label>
              <textarea
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-24 w-full border border-[oklch(.922_0_0)] rounded-md px-3 py-2 text-[13px]"
                placeholder="Add internal notes about this booking..."
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] text-gray-600">
              <div>
                <span className="font-semibold">Created:</span> {new Date(booking.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">Last Updated:</span> {new Date(booking.updatedAt).toLocaleString()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[oklch(.922_0_0)]">
              <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-[13px]">Close</button>
              <button type="submit" disabled={submitting} className="h-9 px-4 rounded-md admin-btn-primary text-white text-[13px] font-semibold disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
