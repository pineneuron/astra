'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import type { Prisma, CouponType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }
}

export async function createCoupon(formData: FormData) {
  await requireAdmin()
  const code = String(formData.get('code') || '').trim().toUpperCase()
  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim() || null
  const type = String(formData.get('type') || 'PERCENTAGE') as CouponType
  const valueRaw = String(formData.get('value') || '').trim()
  const minRaw = String(formData.get('minOrderAmount') || '').trim()
  const maxRaw = String(formData.get('maxDiscountAmount') || '').trim()
  const startDateRaw = String(formData.get('startDate') || '').trim()
  const endDateRaw = String(formData.get('endDate') || '').trim()
  const usageLimitRaw = String(formData.get('usageLimit') || '').trim()
  const isActive = String(formData.get('isActive') || 'false') === 'true' || formData.get('isActive') === 'on'
  if (!code || !name || !valueRaw) return new Response('Missing required fields', { status: 400 })
  const existing = await prisma.coupon.findUnique({ where: { code } })
  if (existing) return new Response('Coupon code already exists', { status: 400 })
  const start = startDateRaw ? new Date(startDateRaw) : new Date()
  const end = endDateRaw ? new Date(endDateRaw) : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  const data: Prisma.CouponCreateInput = {
    code,
    name,
    description: description || undefined,
    type,
    value: valueRaw,
    startDate: start,
    endDate: end,
    isActive,
  }
  if (minRaw) (data as { minOrderAmount?: string }).minOrderAmount = minRaw
  if (maxRaw) (data as { maxDiscountAmount?: string }).maxDiscountAmount = maxRaw
  if (usageLimitRaw) (data as { usageLimit?: number }).usageLimit = Number(usageLimitRaw)
  await prisma.coupon.create({ data })
  revalidatePath('/admin/coupons')
  return new Response('OK')
}

export async function updateCoupon(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '').trim()
  if (!id) return new Response('Missing id', { status: 400 })
  const code = String(formData.get('code') || '').trim().toUpperCase()
  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim() || null
  const type = String(formData.get('type') || 'PERCENTAGE') as CouponType
  const valueRaw = String(formData.get('value') || '').trim()
  const minRaw = String(formData.get('minOrderAmount') || '').trim()
  const maxRaw = String(formData.get('maxDiscountAmount') || '').trim()
  const startDateRaw = String(formData.get('startDate') || '').trim()
  const endDateRaw = String(formData.get('endDate') || '').trim()
  const usageLimitRaw = String(formData.get('usageLimit') || '').trim()
  const isActive = String(formData.get('isActive') || 'false') === 'true' || formData.get('isActive') === 'on'
  if (!code || !name || !valueRaw) return new Response('Missing required fields', { status: 400 })
  const existing = await prisma.coupon.findUnique({ where: { code } })
  if (existing && existing.id !== id) return new Response('Coupon code already exists', { status: 400 })
  const existingCoupon = await prisma.coupon.findUnique({ where: { id } })
  if (!existingCoupon) return new Response('Not found', { status: 404 })
  const updateData: Prisma.CouponUpdateInput = {
    code,
    name,
    description: description || undefined,
    type,
    value: valueRaw,
    isActive,
  }
  if (minRaw) (updateData as { minOrderAmount?: string | null }).minOrderAmount = minRaw
  else (updateData as { minOrderAmount?: undefined }).minOrderAmount = undefined
  if (maxRaw) (updateData as { maxDiscountAmount?: string | null }).maxDiscountAmount = maxRaw
  else (updateData as { maxDiscountAmount?: undefined }).maxDiscountAmount = undefined
  if (startDateRaw) (updateData as { startDate?: Date | string | null }).startDate = new Date(startDateRaw)
  else (updateData as { startDate?: Date | string | null }).startDate = existingCoupon.startDate
  if (endDateRaw) (updateData as { endDate?: Date | string | null }).endDate = new Date(endDateRaw)
  else (updateData as { endDate?: Date | string | null }).endDate = existingCoupon.endDate
  if (usageLimitRaw) (updateData as { usageLimit?: number | null }).usageLimit = Number(usageLimitRaw)
  else (updateData as { usageLimit?: undefined }).usageLimit = undefined
  await prisma.coupon.update({ where: { id }, data: updateData })
  revalidatePath('/admin/coupons')
  return new Response('OK')
}

export async function deleteCoupon(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) return new Response('Missing id', { status: 400 })
  await prisma.coupon.delete({ where: { id } })
  revalidatePath('/admin/coupons')
  return new Response('OK')
}
