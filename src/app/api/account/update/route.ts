import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

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
    const { name, phone, city, address, landmark } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Get or create customer
    let customer = await prisma.customer.findUnique({
      where: { email: session.user.email }
    })

    if (!customer) {
      // Create customer
      customer = await prisma.customer.create({
        data: {
          name,
          email: session.user.email,
          phone: phone || null,
          city: city || null,
          address: address || null,
          landmark: landmark || null
        }
      })
    } else {
      // Update customer
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name,
          phone: phone || null,
          city: city || null,
          address: address || null,
          landmark: landmark || null
        }
      })
    }

    // Also update user name if it exists
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name
        }
      })
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
        landmark: customer.landmark
      }
    })
  } catch (error) {
    console.error('[POST /api/account/update] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}
