import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/db';

const CategoryGridV1 = async () => {
  // Fetch categories without parent, active, and not soft-deleted, ordered by sortOrder
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      deletedAt: null,
      isActive: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  // Fallback to placeholder image if category doesn't have an image
  const getCategoryIcon = (imageUrl: string | null | undefined): string => {
    return imageUrl || '/images/placeholder.png';
  };

  return (
    <div className="tsf-category relative tsf-bg-primary py-20 mt-20">
      <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
        <div className="tsf-category_heading">
          <h2 className="tsf-dark-color text-4xl font-bold z-10">explore by category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="tsf-category-item mt-10 m-auto text-center">
              <Link href={`/products?category=${category.slug}`}>
                <div className="rounded-full">
                  <Image
                    src={getCategoryIcon(category.imageUrl)}
                    className="bg-white rounded-full"
                    alt={category.name}
                    width={180}
                    height={180}
                  />
                </div>
                <h3 className="text-2xl font-bold capitalize mt-4">{category.name}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGridV1;
