import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/db';

type FeaturedCategory = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  imageUrl: string | null;
  type: 'PRODUCT' | 'SERVICE' | 'ALL';
};

async function getFeaturedCategories(): Promise<FeaturedCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null, isActive: true, isFeatured: true },
      select: { id: true, name: true, slug: true, iconUrl: true, imageUrl: true, type: true },
      orderBy: { sortOrder: 'asc' },
    });
    return categories as FeaturedCategory[];
  } catch {
    return [];
  }
}

function getCategoryHref(cat: FeaturedCategory): string {
  if (cat.type === 'PRODUCT') return `/products/category/${cat.slug}`
  if (cat.type === 'SERVICE') return `/services/category/${cat.slug}`
  return `/category/${cat.slug}` // ALL type fallback
}

export default async function CategoryStrip() {
  const categories = await getFeaturedCategories();

  if (categories.length === 0) return null;

  return (
    <section
      className="w-full py-10"
      style={{
        background: 'linear-gradient(90deg, rgba(244, 170, 54, 0.18) 0%, rgba(243, 115, 53, 0.18) 100%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={getCategoryHref(cat)}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src={cat.iconUrl || cat.imageUrl || '/images/placeholder.png'}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="tsf-font-larken text-[20px] text-black text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
