import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { ValidationUtils } from '@/lib/utils'

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
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = ValidationUtils.validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error || 'Invalid password' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'No password set for this account. Please use social login or reset your password.' },
        { status: 400 }
      )
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Check if new password is same as current
    const isSame = await bcrypt.compare(newPassword, user.password)
    if (isSame) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('[POST /api/account/change-password] Error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

