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

export async function createProduct(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim()
  const categoryIdsCsv = String(formData.get('categoryIds') || '')
  const categoryIds = categoryIdsCsv.split(',').map(s => s.trim()).filter(Boolean)
  const categoryId = categoryIds[0] || ''
  const basePrice = Number(formData.get('basePrice') || 0)
  const saleRaw = formData.get('salePrice')
  const salePrice = saleRaw && String(saleRaw).trim() !== '' ? Number(saleRaw) : null
  const unit = String(formData.get('unit') || 'per kg')
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const description = String(formData.get('description') || '').trim() || null
  const shortDescription = String(formData.get('shortDescription') || '').trim() || null
  const imageUrl = String(formData.get('imageUrl') || '') || null
  const imagePublicId = String(formData.get('imagePublicId') || '') || null
  const imagesJson = String(formData.get('images') || '[]')
  let images: Array<{ url: string; publicId?: string | null; isPrimary?: boolean; sortOrder?: number }> = []
  try { images = JSON.parse(imagesJson) } catch {}
  const isFeatured = String(formData.get('isFeatured') || 'false') === 'true'
  const isBestseller = String(formData.get('isBestseller') || 'false') === 'true'
  const isActive = String(formData.get('isActive') || 'false') === 'true'
  if (!name || !rawSlug || !categoryId) return
  // ensure slug unique
  const baseSlug = rawSlug
  let slug = baseSlug
  let i = 2
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`
  }
  const primaryFromImages = images.find(i => i.isPrimary) || images[0]
  const createData: Prisma.ProductCreateInput = {
    name,
    slug,
    category: { connect: { id: categoryId } },
    basePrice,
    salePrice: salePrice ?? undefined,
    unit,
    sortOrder,
    description: description || undefined,
    shortDescription: shortDescription || undefined,
    isActive,
    isFeatured,
    isBestseller,
    imageUrl: (primaryFromImages?.url || imageUrl) || undefined,
    imagePublicId: (primaryFromImages?.publicId || imagePublicId) || undefined,
    categories: {
      create: categoryIds.map(cid => ({ categoryId: cid }))
    }
  }
  if (images.length > 0) {
    const hasPrimary = images.some(i => i.isPrimary)
    createData.images = {
      create: images.map((i, idx) => ({
        imageUrl: i.url,
        publicId: i.publicId || null,
        sortOrder: typeof i.sortOrder === 'number' ? i.sortOrder : idx,
        isPrimary: hasPrimary ? !!i.isPrimary : idx === 0,
      }))
    }
  }
  await prisma.product.create({ data: createData })
  revalidatePath('/admin/products')
}

export async function updateProduct(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const name = String(formData.get('name') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim()
  const categoryIdsCsv = String(formData.get('categoryIds') || '')
  const categoryIds = categoryIdsCsv.split(',').map(s => s.trim()).filter(Boolean)
  const categoryId = categoryIds[0] || ''
  const basePrice = Number(formData.get('basePrice') || 0)
  const saleRaw = formData.get('salePrice')
  const salePrice = saleRaw && String(saleRaw).trim() !== '' ? Number(saleRaw) : null
  const unit = String(formData.get('unit') || 'per kg')
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const description = String(formData.get('description') || '').trim() || null
  const shortDescription = String(formData.get('shortDescription') || '').trim() || null
  const imageUrlUpd = String(formData.get('imageUrl') || '') || null
  const imagePublicIdUpd = String(formData.get('imagePublicId') || '') || null
  const imagesJsonUpd = String(formData.get('images') || '[]')
  let imagesUpd: Array<{ url: string; publicId?: string | null; isPrimary?: boolean; sortOrder?: number }> = []
  try { imagesUpd = JSON.parse(imagesJsonUpd) } catch {}
  const isFeatured = String(formData.get('isFeatured') || 'false') === 'true'
  const isBestseller = String(formData.get('isBestseller') || 'false') === 'true'
  const isActiveUpd = String(formData.get('isActive') || 'false') === 'true'
  if (!id) return
  const primaryFromImagesUpd = imagesUpd.find(i => i.isPrimary) || imagesUpd[0]
  // resolve unique slug on conflict
  let slug = rawSlug
  if (rawSlug) {
    const existing = await prisma.product.findUnique({ where: { slug: rawSlug } })
    if (existing && existing.id !== id) {
      const base = rawSlug
      let n = 2
      slug = `${base}-${n++}`
      while (await prisma.product.findUnique({ where: { slug } })) {
        slug = `${base}-${n++}`
      }
    }
  }
  const updateData: Prisma.ProductUpdateInput = {
    name,
    slug,
    category: { connect: { id: categoryId } },
    basePrice,
    salePrice: salePrice ?? undefined,
    unit,
    sortOrder,
    description: description || undefined,
    shortDescription: shortDescription || undefined,
    isFeatured,
    isBestseller,
    isActive: isActiveUpd,
    imageUrl: (primaryFromImagesUpd?.url || imageUrlUpd) || undefined,
    imagePublicId: (primaryFromImagesUpd?.publicId || imagePublicIdUpd) || undefined,
    categories: {
      deleteMany: {},
      create: categoryIds.map(cid => ({ categoryId: cid }))
    }
  }
  // Always clear existing images; recreate only if provided
  if (imagesUpd.length > 0) {
    const hasPrimaryUpd = imagesUpd.some(i => i.isPrimary)
    updateData.images = {
      deleteMany: {},
      create: imagesUpd.map((i, idx) => ({
        imageUrl: i.url,
        publicId: i.publicId || null,
        sortOrder: typeof i.sortOrder === 'number' ? i.sortOrder : idx,
        isPrimary: hasPrimaryUpd ? !!i.isPrimary : idx === 0,
      })),
    }
  } else {
    updateData.images = { deleteMany: {} }
    updateData.imageUrl = null
    updateData.imagePublicId = null
  }
  await prisma.product.update({ where: { id }, data: updateData })
  revalidatePath('/admin/products')
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const isActive = String(formData.get('isActive') || 'true') === 'true'
  if (!id) return
  await prisma.product.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/products')
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) return
  
  // Use soft delete instead of hard delete to avoid foreign key constraints
  // This marks the product as deleted without removing it from the database
  // This is safer when products have been ordered
  await prisma.product.update({
    where: { id },
    data: { 
      deletedAt: new Date(),
      isActive: false // Also deactivate it
    }
  })
  
  revalidatePath('/admin/products')
}

export async function permanentlyDeleteProduct(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) return
  
  // Check if product has been ordered
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orderItems: true
        }
      }
    }
  })

  if (!product) return

  // Check if product has been ordered
  if (product._count.orderItems > 0) {
    throw new Error('Cannot permanently delete product: This product has been ordered. Please delete the orders first.')
  }

  // Permanently delete the product
  // This will cascade delete product images, variations, inventory, and product category links
  await prisma.product.delete({ where: { id } })
  
  revalidatePath('/admin/products')
}

export async function reorderProducts(formData: FormData) {
  await requireAdmin()
  const idsCsv = String(formData.get('ids') || '')
  const ids = idsCsv.split(',').map(s => s.trim()).filter(Boolean)
  await Promise.all(ids.map((id, idx) => prisma.product.update({ where: { id }, data: { sortOrder: idx } })))
  revalidatePath('/admin/products')
}
