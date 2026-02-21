'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import type { OrderStatus, PaymentStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }
}

export async function updateOrder(formData: FormData, skipAuth = false) {
  // Skip auth check if called from API route (auth is checked there)
  if (!skipAuth) {
    await requireAdmin()
  }
  const id = String(formData.get('id') || '').trim()
  if (!id) return new Response('Missing id', { status: 400 })
  
  const status = String(formData.get('status') || '').trim() as OrderStatus
  const paymentStatus = String(formData.get('paymentStatus') || '').trim() as PaymentStatus
  const notes = String(formData.get('notes') || '').trim() || null
  
  const existingOrder = await prisma.order.findUnique({ where: { id } })
  if (!existingOrder) return new Response('Order not found', { status: 404 })
  
  // Validate status and paymentStatus are valid enum values
  const validStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
  const validPaymentStatuses: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']
  
  if (!validStatuses.includes(status as OrderStatus)) {
    return new Response(`Invalid status: ${status}`, { status: 400 })
  }
  
  if (!validPaymentStatuses.includes(paymentStatus as PaymentStatus)) {
    return new Response(`Invalid payment status: ${paymentStatus}`, { status: 400 })
  }
  
  // Update order status and create status history entry if status changed
  const statusChanged = status !== existingOrder.status
  
  // Always update status and payment status
  const updates: { status: OrderStatus; paymentStatus: PaymentStatus; notes?: string | null } = {
    status: status as OrderStatus,
    paymentStatus: paymentStatus as PaymentStatus,
  }
  
  // Update notes if provided
  if (notes !== undefined) {
    updates.notes = notes
  }
  
  // Update the order
  await prisma.order.update({
    where: { id },
    data: updates,
  })
  
  // Create status history entry only if status actually changed
  if (statusChanged) {
    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status: status as OrderStatus,
        notes: `Status changed from ${existingOrder.status} to ${status}`,
      },
    })
  }
  
  revalidatePath('/admin/orders')
  return new Response('OK')
}

