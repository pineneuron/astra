import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { ValidationUtils } from "@/lib/utils"

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = ValidationUtils.validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error || "Invalid password" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }
    const hash = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
        role: Role.CUSTOMER,
      }
    })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    console.error('Register error:', errorMessage)
    return NextResponse.json({ error: "Registration failed", detail: errorMessage }, { status: 500 })
  }
}
