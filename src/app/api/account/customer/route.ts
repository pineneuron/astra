import { NextResponse } from 'next/server'
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

    // Get or create customer by email
    let customer = await prisma.customer.findUnique({
      where: { email: session.user.email },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1
        }
      }
    })

    // If customer doesn't exist, create one from user data
    if (!customer) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (user && user.name) {
        customer = await prisma.customer.create({
          data: {
            name: user.name,
            email: user.email!,
          },
          include: {
            addresses: true
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

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
        landmark: customer.landmark,
        coordinates: customer.coordinates,
        addresses: customer.addresses.map(addr => ({
          id: addr.id,
          type: addr.type,
          name: addr.name,
          address: addr.address,
          city: addr.city,
          landmark: addr.landmark,
          coordinates: addr.coordinates,
          isDefault: addr.isDefault
        }))
      }
    })
  } catch (error) {
    console.error('[GET /api/account/customer] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer data' },
      { status: 500 }
    )
  }
}
