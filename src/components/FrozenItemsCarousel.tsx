import { ProductService } from '@/lib/services';
import FrozenItemsCarouselClient, { FrozenProduct } from './FrozenItemsCarouselClient';

function transformDbToFrozenProducts(dbCategories: Awaited<ReturnType<typeof ProductService.getAllCategories>>): FrozenProduct[] {
  const frozenSlugs = ['frozen-snacks', 'vegetarian'];
  
  const allProducts: FrozenProduct[] = [];
  
  dbCategories
    .filter(cat => cat.isActive && frozenSlugs.includes(cat.slug))
    .forEach(cat => {
      cat.productLinks
        .map(link => link.product)
        .filter(p => p.isActive)
        .forEach(p => {
        allProducts.push({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.basePrice),
          unit: p.unit,
          discountPercent: p.discountPercent,
          image: p.imageUrl || '/images/placeholder.png',
          images: p.images.length > 0 ? p.images.sort((a, b) => (a.isPrimary ? -1 : 0) - (b.isPrimary ? -1 : 0)).map(img => img.imageUrl) : undefined,
          shortDescription: p.shortDescription || undefined,
          description: p.description || undefined,
          variations: p.variations.length > 0 ? p.variations.map(v => ({ 
            name: v.name, 
            price: Number(v.price), 
            discountPercent: v.discountPercent 
          })) : undefined,
          defaultVariation: p.variations.find(v => v.isDefault)?.name || undefined,
          featured: p.isFeatured,
          bestseller: p.isBestseller,
        });
        });
    });
  
  // Take first 8 items from combined frozen items
  return allProducts.slice(0, 8);
}

export default async function FrozenItemsCarousel() {
  const dbCategories = await ProductService.getAllCategories();
  const frozenProducts = transformDbToFrozenProducts(dbCategories);

  return <FrozenItemsCarouselClient products={frozenProducts} />;
}
