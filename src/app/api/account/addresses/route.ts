import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create customer
    let customer = await prisma.customer.findUnique({
      where: { email: session.user.email }
    })

    if (!customer) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (user && user.name) {
        customer = await prisma.customer.create({
          data: {
            name: user.name,
            email: user.email!,
          }
        })
      }
    }

    if (!customer) {
      return NextResponse.json(
        { addresses: [] }
      )
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: customer.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      addresses: addresses.map(addr => ({
        id: addr.id,
        type: addr.type,
        name: addr.name,
        address: addr.address,
        city: addr.city,
        landmark: addr.landmark,
        coordinates: addr.coordinates as { lat: number; lng: number } | null,
        isDefault: addr.isDefault
      }))
    })
  } catch (error) {
    console.error('[GET /api/account/addresses] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, name, address, city, landmark, coordinates, isDefault } = body

    if (!type || !name || !address || !city) {
      return NextResponse.json(
        { error: 'Type, name, address, and city are required' },
        { status: 400 }
      )
    }

    // Get or create customer
    let customer = await prisma.customer.findUnique({
      where: { email: session.user.email }
    })

    if (!customer) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (user && user.name) {
        customer = await prisma.customer.create({
          data: {
            name: user.name,
            email: user.email!,
          }
        })
      }
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: customer.id, isDefault: true },
        data: { isDefault: false }
      })
    }

    // Create address
    const newAddress = await prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        type,
        name,
        address,
        city,
        landmark: landmark || null,
        coordinates: coordinates || null,
        isDefault: isDefault || false
      }
    })

    return NextResponse.json({
      success: true,
      address: {
        id: newAddress.id,
        type: newAddress.type,
        name: newAddress.name,
        address: newAddress.address,
        city: newAddress.city,
        landmark: newAddress.landmark,
        coordinates: newAddress.coordinates as { lat: number; lng: number } | null,
        isDefault: newAddress.isDefault
      }
    })
  } catch (error) {
    console.error('[POST /api/account/addresses] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
}
