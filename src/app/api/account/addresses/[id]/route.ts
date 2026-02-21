import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { email: session.user.email }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Verify address belongs to customer
    const address = await prisma.customerAddress.findUnique({
      where: { id }
    })

    if (!address || address.customerId !== customer.id) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { type, name, address: addressText, city, landmark, coordinates, isDefault } = body

    if (!type || !name || !addressText || !city) {
      return NextResponse.json(
        { error: 'Type, name, address, and city are required' },
        { status: 400 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { 
          customerId: customer.id, 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    // Update address
    const updatedAddress = await prisma.customerAddress.update({
      where: { id },
      data: {
        type,
        name,
        address: addressText,
        city,
        landmark: landmark || null,
        coordinates: coordinates || null,
        isDefault: isDefault || false
      }
    })

    return NextResponse.json({
      success: true,
      address: {
        id: updatedAddress.id,
        type: updatedAddress.type,
        name: updatedAddress.name,
        address: updatedAddress.address,
        city: updatedAddress.city,
        landmark: updatedAddress.landmark,
        coordinates: updatedAddress.coordinates as { lat: number; lng: number } | null,
        isDefault: updatedAddress.isDefault
      }
    })
  } catch (error) {
    console.error('[PUT /api/account/addresses/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { email: session.user.email }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Verify address belongs to customer
    const address = await prisma.customerAddress.findUnique({
      where: { id }
    })

    if (!address || address.customerId !== customer.id) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    // Delete address
    await prisma.customerAddress.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('[DELETE /api/account/addresses/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}

