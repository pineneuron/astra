import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import BookingsClient from './BookingsClient'
import { deleteBooking } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; dir?: 'asc' | 'desc' }> }) {
  const sp = await searchParams
  const q = (sp?.q || '').trim()
  const sort = (sp?.sort || '').trim()
  const dir = (sp?.dir === 'asc' || sp?.dir === 'desc') ? sp?.dir : 'desc'

  const allowed = new Set(['bookingNumber', 'fullName', 'email', 'amount', 'status', 'createdAt'])
  const dirVal: Prisma.SortOrder = dir === 'asc' ? 'asc' : 'desc'
  const orderBy: Prisma.BookingOrderByWithRelationInput = allowed.has(sort)
    ? { [sort]: dirVal } as Prisma.BookingOrderByWithRelationInput
    : { createdAt: 'desc' }

  const bookings = await prisma.booking.findMany({
    where: q ? {
      OR: [
        { bookingNumber: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { service: { title: { contains: q, mode: 'insensitive' } } },
      ]
    } : undefined,
    orderBy,
    include: {
      service: true,
    },
  })

  const uiBookings = bookings.map(b => ({
    id: b.id,
    bookingNumber: b.bookingNumber,
    serviceId: b.serviceId,
    serviceTitle: b.service.title,
    fullName: b.fullName,
    email: b.email,
    phone: b.phone,
    gender: b.gender,
    dateOfBirth: b.dateOfBirth.toISOString().slice(0, 10),
    timeOfBirth: b.timeOfBirth,
    placeOfBirth: b.placeOfBirth,
    amount: Number(b.amount),
    currency: b.currency,
    status: b.status,
    paymentScreenshot: b.paymentScreenshot || null,
    notes: b.notes || null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }))

  return (
    <BookingsClient q={q} bookings={uiBookings} actions={{ deleteBooking }} />
  )
}
