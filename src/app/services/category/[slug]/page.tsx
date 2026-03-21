import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import ServicesSection from '@/components/ServicesSection'
import type { ServiceItem } from '@/components/ServicesSection'
import { prisma } from '@/lib/db'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug, deletedAt: null, isActive: true },
    select: { name: true },
  })
  if (!category) return {}
  return {
    title: `${category.name} Services - Astra`,
    description: `Browse ${category.name} services.`,
  }
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { slug } = await params

  const category = await prisma.category.findUnique({
    where: { slug, deletedAt: null, isActive: true },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!category) notFound()

  const serviceItems: ServiceItem[] = category.services.map((s) => {
    const originalPrice = Number(s.price)
    const salePrice = s.salePrice != null ? Number(s.salePrice) : null
    const displayPrice = salePrice ?? originalPrice
    const hasPrice = displayPrice > 0
    return {
      title: s.title,
      ...(hasPrice
        ? {
            price: displayPrice,
            priceUnit: s.priceUnit,
            ...(salePrice != null && { originalPrice }),
          }
        : { priceAlternativeText: 'Consult for pricing' }),
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
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/services' },
                { label: category.name },
              ]}
            />
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 pt-10">
          <h1 className="tsf-font-larken text-black text-[40px] lg:text-[52px] font-bold leading-tight mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="tsf-font-public-sans text-gray-600 text-[16px] lg:text-[18px] max-w-[680px]">
              {category.description}
            </p>
          )}
        </div>

        {serviceItems.length > 0 ? (
          <ServicesSection services={serviceItems} />
        ) : (
          <div className="max-w-[1200px] mx-auto px-6 pt-16 text-center">
            <p className="tsf-font-public-sans text-gray-500 text-[16px]">
              No services available in this category yet.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
