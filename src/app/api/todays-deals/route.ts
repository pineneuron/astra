import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Get top 3 bestseller products with images
        const products = await ProductService.getBestsellerProducts(10)

        // Filter products that have images (not placeholder)
        const productsWithImages = products
            .filter(product => product.imageUrl && product.imageUrl !== '/images/placeholder.png')
            .slice(0, 3)

        const dealProducts = productsWithImages.map(product => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(product.basePrice),
            unit: product.unit,
            discountPercent: product.discountPercent,
            image: product.imageUrl || '/images/placeholder.png',
            images: product.images.length > 0
                ? product.images.sort((a, b) => (a.isPrimary ? -1 : 0) - (b.isPrimary ? -1 : 0)).map(img => img.imageUrl)
                : undefined,
            shortDescription: product.shortDescription || undefined,
            description: product.description || undefined,
            variations: product.variations.length > 0
                ? product.variations.map(v => ({
                    name: v.name,
                    price: Number(v.price),
                    discountPercent: v.discountPercent,
                }))
                : undefined,
            defaultVariation: product.variations.find(v => v.isDefault)?.name || undefined,
            featured: product.isFeatured,
            bestseller: product.isBestseller,
        }))

        return NextResponse.json(dealProducts)
    } catch (error) {
        console.error('Error fetching today\'s deals:', error)
        return NextResponse.json(
            { error: 'Failed to fetch today\'s deals' },
            { status: 500 }
        )
    }
}
