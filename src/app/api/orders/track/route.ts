import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get('orderNumber')?.trim()
    const email = searchParams.get('email')?.trim()

    if (!orderNumber && !email) {
      return NextResponse.json(
        { error: 'Order number or email is required' },
        { status: 400 }
      )
    }

    const where: {
      orderNumber?: string
      customerEmail?: string
    } = {}
    if (orderNumber) {
      where.orderNumber = orderNumber
    }
    if (email) {
      where.customerEmail = email
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Serialize the orders
    const serializedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerCity: order.customerCity,
      customerAddress: order.customerAddress,
      customerLandmark: order.customerLandmark,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discountAmount: Number(order.discountAmount),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      deliveryDate: order.deliveryDate?.toISOString() || null,
      deliveryTimeSlot: order.deliveryTimeSlot,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        productName: item.productName,
        productImageUrl: item.productImageUrl,
        variationName: item.variationName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discountAmount: Number(item.discountAmount),
        totalPrice: Number(item.totalPrice)
      })),
      statusHistory: order.statusHistory.map(history => ({
        id: history.id,
        status: history.status,
        notes: history.notes,
        createdAt: history.createdAt.toISOString()
      }))
    }))

    return NextResponse.json({ orders: serializedOrders })
  } catch (error) {
    console.error('[GET /api/orders/track] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

