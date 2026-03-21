'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createService(formData: FormData) {
  await requireAdmin()
  const title = String(formData.get('title') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim()
  const slug = rawSlug || slugify(title)
  const price = Number(formData.get('price') || 0)
  const salePriceRaw = String(formData.get('salePrice') || '').trim()
  const salePrice = salePriceRaw ? Number(salePriceRaw) : null
  const priceUnit = String(formData.get('priceUnit') || 'NPR')
  const description = String(formData.get('description') || '').trim() || null
  const imageUrl = String(formData.get('imageUrl') || '').trim() || null
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const isActive = String(formData.get('isActive') || 'true') === 'true'
  const isFeatured = String(formData.get('isFeatured') || 'false') === 'true'
  const categoryId = String(formData.get('categoryId') || '').trim() || null

  if (!title) return

  let finalSlug = slug
  let i = 2
  while (await prisma.service.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${i++}`
  }

  const createData: Prisma.ServiceCreateInput = {
    title,
    slug: finalSlug,
    price,
    salePrice: salePrice ?? undefined,
    priceUnit,
    description: description || undefined,
    imageUrl: imageUrl || undefined,
    sortOrder,
    isActive,
    isFeatured,
    ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
  }
  await prisma.service.create({ data: createData })
  revalidatePath('/admin/services')
}

export async function updateService(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const title = String(formData.get('title') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim()
  const price = Number(formData.get('price') || 0)
  const salePriceRaw = String(formData.get('salePrice') || '').trim()
  const salePrice = salePriceRaw ? Number(salePriceRaw) : null
  const priceUnit = String(formData.get('priceUnit') || 'NPR')
  const description = String(formData.get('description') || '').trim() || null
  const imageUrl = String(formData.get('imageUrl') || '').trim() || null
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const isActive = String(formData.get('isActive') || 'true') === 'true'
  const isFeatured = String(formData.get('isFeatured') || 'false') === 'true'
  const categoryId = String(formData.get('categoryId') || '').trim() || null

  if (!id) return

  const existingService = await prisma.service.findUnique({ where: { id } })
  if (!existingService) return

  let finalSlug = rawSlug || slugify(title) || existingService.slug
  if (finalSlug) {
    const existing = await prisma.service.findUnique({ where: { slug: finalSlug } })
    if (existing && existing.id !== id) {
      const base = finalSlug
      let n = 2
      finalSlug = `${base}-${n++}`
      while (await prisma.service.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${base}-${n++}`
      }
    }
  }

  const updateData: Prisma.ServiceUpdateInput = {
    title,
    slug: finalSlug,
    price,
    salePrice: salePrice ?? null,
    priceUnit,
    description: description || undefined,
    imageUrl: imageUrl || undefined,
    sortOrder,
    isActive,
    isFeatured,
    category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
  }
  await prisma.service.update({ where: { id }, data: updateData })
  revalidatePath('/admin/services')
}

export async function toggleServiceActive(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const isActive = String(formData.get('isActive') || 'true') === 'true'
  if (!id) return
  await prisma.service.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/services')
}

export async function deleteService(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) return

  const service = await prisma.service.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  })

  if (!service) return

  if (service._count.bookings > 0) {
    throw new Error('Cannot delete service: This service has bookings. Remove or reassign the bookings first.')
  }

  await prisma.service.delete({ where: { id } })
  revalidatePath('/admin/services')
}

export async function reorderServices(formData: FormData) {
  await requireAdmin()
  const idsCsv = String(formData.get('ids') || '')
  const ids = idsCsv.split(',').map((s) => s.trim()).filter(Boolean)
  await Promise.all(ids.map((id, idx) => prisma.service.update({ where: { id }, data: { sortOrder: idx } })))
  revalidatePath('/admin/services')
}
