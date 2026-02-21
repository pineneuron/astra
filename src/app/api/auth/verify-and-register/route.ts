import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { ValidationUtils } from "@/lib/utils"

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { name, email, password, code } = await req.json()
    if (!name || !email || !password || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = ValidationUtils.validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error || "Invalid password" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Verify the code
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: code,
        expires: { gt: new Date() }
      }
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10)

    // Create user
    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hash,
        role: Role.CUSTOMER,
        emailVerified: new Date(),
      }
    })

    // Delete verification token after successful registration
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: normalizedEmail,
        token: code,
      }
    })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    console.error('Verify and register error:', errorMessage)
    return NextResponse.json({ error: "Registration failed", detail: errorMessage }, { status: 500 })
  }
}
