import { prisma } from '@/lib/db'
import { createProduct, updateProduct, deleteProduct, toggleProductActive, reorderProducts, permanentlyDeleteProduct } from './actions'
import ProductsClient from './ProductsClient'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; showDeleted?: string }> }) {
  const sp = await searchParams
  const q = (sp?.q || '').trim()
  const showDeleted = sp?.showDeleted === 'true'
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ 
      where: showDeleted ? { deletedAt: { not: null } } : { deletedAt: null },
      orderBy: { name: 'asc' } 
    }),
    prisma.product.findMany({
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
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { images: { orderBy: { sortOrder: 'asc' } }, categories: true },
    }),
  ])

  const productsWithCategory = products.map((p) => ({
    ...p,
    // Convert Prisma Decimal to plain number for client components
    basePrice: Number(p.basePrice),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    selectedCategoryIds: p.categories.map((pc) => pc.categoryId),
    categoryName: categories.find((c) => c.id === p.categoryId)?.name ?? null,
    categoryNames: (() => {
      const names = p.categories
        .map((pc) => categories.find((c) => c.id === pc.categoryId)?.name)
        .filter(Boolean) as string[]
      if (names.length === 0) {
        const primary = categories.find((c) => c.id === p.categoryId)?.name
        return primary ? [primary] : []
      }
      return names
    })(),
  }))

  return (
    <ProductsClient
      q={q}
      showDeleted={showDeleted}
      categories={categories}
      products={productsWithCategory}
      actions={{ createProduct, updateProduct, deleteProduct, toggleProductActive, reorderProducts, permanentlyDeleteProduct }}
    />
  )
}
