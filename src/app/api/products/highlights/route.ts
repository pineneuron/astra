import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function serializeProduct(product: Awaited<ReturnType<typeof ProductService.getFeaturedProducts>>[number]) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.basePrice),
    unit: product.unit,
    discountPercent: product.discountPercent,
    image: product.imageUrl || '/images/placeholder.png',
    images: product.images.length > 0
      ? product.images
          .slice()
          .sort((a, b) => (a.isPrimary ? -1 : 0) - (b.isPrimary ? -1 : 0))
          .map((img) => img.imageUrl)
      : undefined,
    shortDescription: product.shortDescription || undefined,
    description: product.description || undefined,
    variations: product.variations.length > 0
      ? product.variations.map((variation) => ({
          name: variation.name,
          price: Number(variation.price),
          discountPercent: variation.discountPercent
        }))
      : undefined,
    defaultVariation: product.variations.find((variation) => variation.isDefault)?.name || undefined,
    featured: product.isFeatured,
    bestseller: product.isBestseller
  }
}

export async function GET() {
  try {
    const [bestsellers, featured] = await Promise.all([
      ProductService.getBestsellerProducts(12),
      ProductService.getFeaturedProducts(12)
    ])

    return NextResponse.json({
      bestsellers: bestsellers.filter((product) => product.isActive).map(serializeProduct),
      featured: featured.filter((product) => product.isActive).map(serializeProduct)
    })
  } catch (error) {
    console.error('[API] Failed to load product highlights:', error)
    return NextResponse.json(
      { error: 'Failed to load product highlights' },
      { status: 500 }
    )
  }
}
