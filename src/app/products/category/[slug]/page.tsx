import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import ProductsCatalog from '@/components/ProductsCatalog'
import type { Category as CatalogCategory } from '@/components/ProductsCatalog'
import CartSidebar from '@/components/CartSidebar'
import { prisma } from '@/lib/db'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug, deletedAt: null, isActive: true },
    select: { name: true },
  })
  if (!category) return {}
  return {
    title: `${category.name} Products - Astra`,
    description: `Browse ${category.name} products.`,
  }
}

export default async function ProductCategoryPage({ params }: Props) {
  const { slug } = await params

  const category = await prisma.category.findUnique({
    where: { slug, deletedAt: null, isActive: true },
    include: {
      productLinks: {
        where: { product: { isActive: true } },
        include: {
          product: {
            include: {
              images: true,
              variations: true,
            },
          },
        },
        orderBy: { product: { sortOrder: 'asc' } },
      },
    },
  })

  if (!category) notFound()

  const productItems: CatalogCategory['products'] = category.productLinks.map(({ product: p }) => ({
    id: p.id,
    name: p.name,
    price: Number(p.basePrice),
    unit: p.unit,
    discountPercent: p.discountPercent,
    image:
      p.images.find((img) => img.isPrimary)?.imageUrl ??
      p.images[0]?.imageUrl ??
      p.imageUrl ??
      '/images/placeholder.png',
    images:
      p.images.length > 0
        ? p.images
            .sort((a, b) => (a.isPrimary ? -1 : 0) - (b.isPrimary ? -1 : 0))
            .map((img) => img.imageUrl)
        : undefined,
    shortDescription: p.shortDescription ?? undefined,
    description: p.description ?? undefined,
    variations:
      p.variations.length > 0
        ? p.variations.map((v) => ({
            name: v.name,
            price: Number(v.price),
            discountPercent: v.discountPercent,
          }))
        : undefined,
    defaultVariation: p.variations.find((v) => v.isDefault)?.name ?? undefined,
    featured: p.isFeatured,
    bestseller: p.isBestseller,
  }))

  const catalogCategories: CatalogCategory[] = [
    {
      id: category.id,
      name: category.name,
      slug: category.slug,
      products: productItems,
    },
  ]

  return (
    <>
      <Header variant="inner" />
      <main className="min-h-screen pb-[100px]">
        <div className="bg-[#f2f2f2]">
          <div className="max-w-[1200px] mx-auto px-6 py-5">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
                { label: category.name },
              ]}
            />
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-4">
          <h1 className="tsf-font-larken text-black text-[40px] lg:text-[52px] font-bold leading-tight mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="tsf-font-public-sans text-gray-600 text-[16px] lg:text-[18px] max-w-[680px]">
              {category.description}
            </p>
          )}
        </div>

        {productItems.length > 0 ? (
          <div className="max-w-[1200px] mx-auto px-6">
            <ProductsCatalog categories={catalogCategories} />
          </div>
        ) : (
          <div className="max-w-[1200px] mx-auto px-6 pt-16 text-center">
            <p className="tsf-font-public-sans text-gray-500 text-[16px]">
              No products available in this category yet.
            </p>
          </div>
        )}
      </main>
      <CartSidebar />
      <Footer />
    </>
  )
}
