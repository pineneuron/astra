import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductsCatalog, { Category } from '../../components/ProductsCatalog';
import CartSidebar from '../../components/CartSidebar';
import { prisma } from '@/lib/db';

function transformDbToCategory(dbCategories: Awaited<ReturnType<typeof getTopLevelCategories>>): Category[] {
  return dbCategories
    .map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.iconUrl || '/images/placeholder.png',
      products: cat.productLinks
        .map(link => link.product)
        .filter(p => p.isActive)
        .map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.basePrice),
          unit: p.unit,
          discountPercent: p.discountPercent,
          image: p.imageUrl || '/images/placeholder.png',
          images: p.images.length > 0 ? p.images.sort((a, b) => (a.isPrimary ? -1 : 0) - (b.isPrimary ? -1 : 0)).map(img => img.imageUrl) : undefined,
          shortDescription: p.shortDescription || undefined,
          description: p.description || undefined,
          variations: p.variations.length > 0 ? p.variations.map(v => ({ name: v.name, price: Number(v.price), discountPercent: v.discountPercent })) : undefined,
          defaultVariation: p.variations.find(v => v.isDefault)?.name || undefined,
          featured: p.isFeatured,
          bestseller: p.isBestseller,
        }))
    }))
    .filter(cat => cat.products.length > 0)
}

async function getTopLevelCategories() {
  // Fetch categories without parent, active, and not soft-deleted, ordered by sortOrder
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      deletedAt: null,
      isActive: true,
    },
    include: {
      productLinks: {
        include: {
          product: {
            include: {
              images: true,
              variations: true,
              inventory: true
            }
          }
        },
        where: { product: { isActive: true } }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });

  // Sort products by sortOrder for each category
  return categories.map(cat => ({
    ...cat,
    productLinks: cat.productLinks.sort((a, b) => a.product.sortOrder - b.product.sortOrder)
  }))
}

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ category?: string }> 
}) {
  const sp = await searchParams;
  const dbCategories = await getTopLevelCategories();
  const categories = transformDbToCategory(dbCategories);
  
  return (
    <>
      <Header variant="inner" />

      <div className="tsf-our-product pt-18 pb-10">
        <div className="w-full">
          <ProductsCatalog categories={categories} initialCategorySlug={sp?.category} />
        </div>
      </div>

      <CartSidebar />

      <Footer />
    </>
  );
}
