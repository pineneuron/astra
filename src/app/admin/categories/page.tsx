import { prisma } from '@/lib/db'
import { createCategory, updateCategory, deleteCategory, toggleCategoryActive, reorderCategories, permanentlyDeleteCategory } from './actions'
import CategoriesClient from './CategoriesClient'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ q?: string; showDeleted?: string }> }) {
  const sp = await searchParams
  const q = (sp?.q || '').trim()
  const showDeleted = sp?.showDeleted === 'true'
  
  const categories = await prisma.category.findMany({
    where: {
      ...(showDeleted ? { deletedAt: { not: null } } : { deletedAt: null }), // Show only deleted if showDeleted is true, otherwise only non-deleted
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  const parents = await prisma.category.findMany({ 
    where: showDeleted ? { deletedAt: { not: null } } : { deletedAt: null },
    orderBy: { name: 'asc' } 
  })
  type WithParentId = { parentId?: string | null }
  const categoriesWithParent = categories.map((c) => {
    const pid = (c as unknown as WithParentId).parentId || null
    const parentName = pid ? parents.find((p) => p.id === pid)?.name ?? null : null
    return { ...c, parentName, productCount: c._count.products }
  })

  return (
    <CategoriesClient
      q={q}
      showDeleted={showDeleted}
      categories={categoriesWithParent}
      parents={parents}
      actions={{ createCategory, updateCategory, deleteCategory, toggleCategoryActive, reorderCategories, permanentlyDeleteCategory }}
    />
  )
}
