import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CategoryType } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const featured = searchParams.get('featured') === 'true'
    const typeParam = searchParams.get('type') as CategoryType | null

    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...(featured ? { isFeatured: true } : {}),
        ...(typeParam ? { type: typeParam } : {}),
      },
      include: {
        productLinks: {
          where: { product: { isActive: true } },
          select: { productId: true },
        },
        _count: { select: { services: { where: { isActive: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    })

    const payload = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      iconUrl: category.iconUrl,
      imageUrl: category.imageUrl,
      type: category.type,
      isFeatured: category.isFeatured,
      productCount: category.productLinks.length,
      serviceCount: category._count.services,
    }))

    return NextResponse.json(payload)
  } catch (error) {
    console.error('[API] Failed to load category summary:', error)
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    )
  }
}
