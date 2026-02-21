import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await ProductService.getAllCategories()

    const payload = categories
      .filter((category) => category.isActive)
      .map((category) => ({
        id: category.id,
        name: category.name,
        productCount: category.productLinks.filter((link) => link.product.isActive).length
      }))
      .filter((category) => category.productCount > 0)

    return NextResponse.json(payload)
  } catch (error) {
    console.error('[API] Failed to load category summary:', error)
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    )
  }
}
