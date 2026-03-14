'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import type { BookingStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }
}

export async function updateBooking(formData: FormData, skipAuth = false) {
  if (!skipAuth) {
    await requireAdmin()
  }
  const id = String(formData.get('id') || '').trim()
  if (!id) return new Response('Missing id', { status: 400 })

  const status = String(formData.get('status') || '').trim() as BookingStatus
  const notes = String(formData.get('notes') || '').trim() || null

  const existingBooking = await prisma.booking.findUnique({ where: { id } })
  if (!existingBooking) return new Response('Booking not found', { status: 404 })

  const validStatuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED']
  if (!validStatuses.includes(status as BookingStatus)) {
    return new Response(`Invalid status: ${status}`, { status: 400 })
  }

  await prisma.booking.update({
    where: { id },
    data: { status: status as BookingStatus, notes },
  })

  revalidatePath('/admin/bookings')
  return new Response('OK')
}

export async function deleteBooking(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '').trim()
  if (!id) throw new Error('Missing booking id')

  await prisma.booking.delete({ where: { id } })

  revalidatePath('/admin/bookings')
}
