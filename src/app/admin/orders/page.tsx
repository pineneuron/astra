import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import OrdersClient from './OrdersClient'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; dir?: 'asc' | 'desc' }> }) {
  const sp = await searchParams
  const q = (sp?.q || '').trim()
  const sort = (sp?.sort || '').trim()
  const dir = (sp?.dir === 'asc' || sp?.dir === 'desc') ? sp?.dir : 'desc'
  
  // Allowed sort fields
  const allowed = new Set(['orderNumber', 'customerName', 'customerEmail', 'totalAmount', 'status', 'paymentStatus', 'createdAt'])
  const dirVal: Prisma.SortOrder = dir === 'asc' ? 'asc' : 'desc'
  const orderBy: Prisma.OrderOrderByWithRelationInput = allowed.has(sort)
    ? { [sort]: dirVal } as Prisma.OrderOrderByWithRelationInput
    : { createdAt: 'desc' }

  const orders = await prisma.order.findMany({
    where: q ? {
      OR: [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
      ]
    } : undefined,
    orderBy,
    include: {
      items: true,
      customer: true,
    },
  })

  // Serialize orders for client component
  const uiOrders = orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone || null,
    customerAlternativePhone: order.customerAlternativePhone || null,
    customerCity: order.customerCity || null,
    customerAddress: order.customerAddress || null,
    customerLandmark: order.customerLandmark || null,
    customerCoordinates: order.customerCoordinates as { lat: number; lng: number } | null,
    customerNotes: order.customerNotes || null,
    paymentScreenshot: order.paymentScreenshot || null,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discountAmount: Number(order.discountAmount),
    taxAmount: Number(order.taxAmount),
    totalAmount: Number(order.totalAmount),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod || null,
    paymentReference: order.paymentReference || null,
    deliveryDate: order.deliveryDate ? order.deliveryDate.toISOString() : null,
    deliveryTimeSlot: order.deliveryTimeSlot || null,
    notes: order.notes || null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.productImageUrl || null,
      variationName: item.variationName || null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discountAmount: Number(item.discountAmount),
      totalPrice: Number(item.totalPrice),
    })),
  }))

  return (
    <OrdersClient q={q} orders={uiOrders} />
  )
}
