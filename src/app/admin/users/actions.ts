'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }
}

export async function createUser(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const image = String(formData.get('imageUrl') || '').trim() || null
  const role = (String(formData.get('role') || 'CUSTOMER') as Role)
  const passwordRaw = String(formData.get('password') || '')
  if (!name || !email) return
  // unique email
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new Error('Email already exists')
  const data: { name: string; email: string; image?: string; role: Role; password?: string } = { name, email, role }
  if (image) data.image = image
  if (passwordRaw) {
    const hash = await bcrypt.hash(passwordRaw, 10)
    data.password = hash
  }
  await prisma.user.create({ data })
  revalidatePath('/admin/users')
}

export async function updateUser(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const image = String(formData.get('imageUrl') || '').trim() || null
  const role = (String(formData.get('role') || 'CUSTOMER') as Role)
  const passwordRaw = String(formData.get('password') || '')
  if (!id) return
  // ensure email uniqueness
  if (email) {
    const other = await prisma.user.findUnique({ where: { email } })
    if (other && other.id !== id) throw new Error('Email already exists')
  }
  const data: { name?: string; email?: string; image?: string | null; role?: Role; password?: string } = {}
  if (name) data.name = name
  if (email) data.email = email
  data.image = image || null
  data.role = role
  if (passwordRaw) {
    const hash = await bcrypt.hash(passwordRaw, 10)
    data.password = hash
  }
  await prisma.user.update({ where: { id }, data })
  revalidatePath('/admin/users')
}

export async function deleteUser(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) return
  await prisma.user.delete({ where: { id } })
  revalidatePath('/admin/users')
}
