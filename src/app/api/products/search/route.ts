import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim() || '';
    const categoryId = searchParams.get('categoryId') || undefined;

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const products = await ProductService.searchProducts(query, categoryId);

    // Limit results to 10 for autocomplete
    const limitedProducts = products.slice(0, 10).map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      unit: product.unit,
      discountPercent: product.discountPercent,
      image: product.imageUrl || '/images/placeholder.png',
      images: product.images.length > 0
        ? product.images
            .sort((a, b) => (a.isPrimary ? -1 : 0) - (b.isPrimary ? -1 : 0))
            .map(img => img.imageUrl)
        : [],
      shortDescription: product.shortDescription || undefined,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
    }));

    return NextResponse.json(limitedProducts);
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}

