import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { ValidationUtils } from "@/lib/utils"

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email, token, password } = await req.json()
    if (!email || !token || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = ValidationUtils.validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error || "Invalid password" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verify the reset token
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: `reset:${normalizedEmail}`,
        token,
        expires: { gt: new Date() }
      }
    })

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Delete the reset token after successful password reset
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: `reset:${normalizedEmail}`,
        token,
      }
    })

    return NextResponse.json({ success: true, message: "Password has been reset successfully" })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    console.error('Reset password error:', errorMessage)
    return NextResponse.json({ error: "Failed to reset password", detail: errorMessage }, { status: 500 })
  }
}

