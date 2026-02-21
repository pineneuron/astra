'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }
  return session
}

export async function createCategory(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim()
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const parentId = String(formData.get('parentId') || '') || null
  const imageUrl = String(formData.get('imageUrl') || '') || null
  const imagePublicId = String(formData.get('imagePublicId') || '') || null
  const iconUrl = String(formData.get('iconUrl') || '') || null
  const iconPublicId = String(formData.get('iconPublicId') || '') || null
  if (!name || !rawSlug) return
  // ensure unique slug by suffixing -2, -3 ... if needed
  const base = rawSlug
  let slug = base
  let n = 2
  // loop until unique
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`
  }
  await prisma.category.create({ data: { name, slug, sortOrder, isActive: true, parentId: parentId || undefined, imageUrl: imageUrl || undefined, imagePublicId: imagePublicId || undefined, iconUrl: iconUrl || undefined, iconPublicId: iconPublicId || undefined } })
  revalidatePath('/admin/categories')
}

export async function updateCategory(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const name = String(formData.get('name') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim()
  const sortOrder = Number(formData.get('sortOrder') || 0)
  const parentId = String(formData.get('parentId') || '') || null
  const imageUrl = String(formData.get('imageUrl') || '') || null
  const imagePublicId = String(formData.get('imagePublicId') || '') || null
  const iconUrl = String(formData.get('iconUrl') || '') || null
  const iconPublicId = String(formData.get('iconPublicId') || '') || null
  if (!id) return
  // if slug collides with another record, suffix it
  let slug = rawSlug
  if (rawSlug) {
    const existing = await prisma.category.findUnique({ where: { slug: rawSlug } })
    if (existing && existing.id !== id) {
      const base = rawSlug
      let n = 2
      slug = `${base}-${n++}`
      while (await prisma.category.findUnique({ where: { slug } })) {
        slug = `${base}-${n++}`
      }
    }
  }
  await prisma.category.update({ where: { id }, data: { name, slug, sortOrder, parentId: parentId === null ? null : parentId, imageUrl: imageUrl || undefined, imagePublicId: imagePublicId || undefined, iconUrl: iconUrl || undefined, iconPublicId: iconPublicId || undefined } })
  revalidatePath('/admin/categories')
}

export async function toggleCategoryActive(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const isActive = String(formData.get('isActive') || 'true') === 'true'
  if (!id) return
  await prisma.category.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/categories')
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) return
  
  // Use soft delete instead of hard delete to avoid foreign key constraints
  // This marks the category as deleted without removing it from the database
  // This is safer when categories have products that may be referenced in orders
  await prisma.category.update({
    where: { id },
    data: { 
      deletedAt: new Date(),
      isActive: false // Also deactivate it
    }
  })
  
  revalidatePath('/admin/categories')
}

export async function reorderCategories(formData: FormData) {
  await requireAdmin()
  const idsCsv = String(formData.get('ids') || '')
  const ids = idsCsv.split(',').map(s => s.trim()).filter(Boolean)
  // apply incremental sortOrder
  await Promise.all(ids.map((id, idx) => prisma.category.update({ where: { id }, data: { sortOrder: idx } })))
  revalidatePath('/admin/categories')
}

export async function permanentlyDeleteCategory(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) return
  
  // Check if category has products that have been ordered
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          _count: {
            select: {
              orderItems: true
            }
          }
        }
      }
    }
  })

  if (!category) return

  // Check if any products in this category have been ordered
  const hasOrderedProducts = category.products.some(product => product._count.orderItems > 0)

  if (hasOrderedProducts) {
    throw new Error('Cannot permanently delete category: Some products in this category have been ordered. Please delete the orders first.')
  }

  // Permanently delete the category
  // This will cascade delete products, product images, variations, inventory, and product category links
  await prisma.category.delete({ where: { id } })
  
  revalidatePath('/admin/categories')
}
