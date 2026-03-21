import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { prisma } from '@/lib/db'
import ServicesSection from '@/components/ServicesSection'

export const metadata: Metadata = {
  title: 'Services - Astra',
  description: 'Our astrology and consultancy services.',
}

export default async function ServicesPage() {
  const dbServices = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  const services = dbServices.map((s) => {
    const isHomeVastu = s.slug === 'home-vastu'
    const originalPrice = Number(s.price)
    const salePrice = s.salePrice != null ? Number(s.salePrice) : null
    const displayPrice = salePrice ?? originalPrice
    return {
      title: s.title,
      ...(isHomeVastu
        ? {
            price: displayPrice,
            priceUnit: s.priceUnit,
            ...(salePrice != null && { originalPrice }),
          }
        : { priceAlternativeText: 'Service Coming Soon' }),
      image: s.imageUrl ?? '/images/placeholder.png',
      href: `/services/${s.slug}/book`,
      slug: s.slug,
      buttonText: 'Book Now' as const,
    }
  })

  return (
    <>
      <Header variant="inner" />
      <main className="min-h-screen pb-[100px]">
        <div className="bg-[#f2f2f2]">
          <div className="max-w-[1200px] mx-auto px-6 py-5">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Services' }]} />
          </div>
        </div>
        <ServicesSection services={services} />
      </main>
      <Footer />
    </>
  )
}
