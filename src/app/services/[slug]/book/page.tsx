import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ServiceBookingForm from './ServiceBookingForm';

export default async function ServiceBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dbService = await prisma.service.findUnique({
    where: { slug, isActive: true },
  });
  if (!dbService) notFound();

  const originalPrice = Number(dbService.price);
  const salePrice = dbService.salePrice != null ? Number(dbService.salePrice) : null;
  const price = salePrice ?? originalPrice;
  const isHomeVastu = dbService.slug === 'home-vastu';

  const service = {
    title: dbService.title,
    price,
    priceUnit: dbService.priceUnit,
    ...(salePrice != null && { originalPrice }),
    ...(!isHomeVastu && { priceAlternativeText: 'Service Coming Soon' as const }),
    image: dbService.imageUrl ?? '/images/placeholder.png',
    href: `/services/${dbService.slug}`,
    slug: dbService.slug,
    buttonText: 'Book Now',
  };

  return (
    <>
      <Header variant="inner" />
      <main className="min-h-screen pb-[100px]">
        <div className="mb-14 bg-[#f2f2f2]">
          <div className="max-w-[1200px] mx-auto px-6 py-5">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/services' },
                { label: service.title },
              ]}
            />
          </div>
        </div>
        <ServiceBookingForm service={service} />
      </main>
      <Footer />
    </>
  );
}
