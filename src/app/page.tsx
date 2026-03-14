import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import HeroBanner from '@/components/HeroBanner'
import AboutSection from '@/components/AboutSection'
import CategoryStrip from '@/components/CategoryStrip'
import ServicesSection from '@/components/ServicesSection'
import type { ServiceItem } from '@/components/ServicesSection'
import { prisma } from '@/lib/db'
import ZodiacSection from '@/components/ZodiacSection'
import EventsSection from '@/components/EventsSection'
import BookingSection from '@/components/BookingSection'
import ReviewsSlider from '@/components/ReviewsSlider'
import CtaBanner from '@/components/CtaBanner'
import BlogSection from '@/components/BlogSection'
import FaqSection from '@/components/FaqSection'
import SubscribeSection from '@/components/SubscribeSection'

/** Static cards shown in Services section (same design as dynamic services). Use priceAlternativeText instead of price. */
const STATIC_SERVICE_ITEMS: ServiceItem[] = [
  {
    title: 'Rudraksha',
    priceAlternativeText: 'Consult or Buy',
    image: '/images/services/svc-rudraksha.jpg',
    href: '/',
    slug: 'rudraksha',
    buttonText: 'Buy Now',
  },
  {
    title: 'Vedic Gemstone',
    priceAlternativeText: 'Consult or Buy',
    image: '/images/services/svc-gemstone.jpg',
    href: '/',
    slug: 'vedic-gemstone',
    buttonText: 'Buy Now',
  },
]

function interleaveServicesWithStatics(services: ServiceItem[], statics: ServiceItem[]): ServiceItem[] {
  const result: ServiceItem[] = []
  const max = Math.max(services.length, statics.length)
  for (let i = 0; i < max; i++) {
    if (i < services.length) result.push(services[i])
    if (i < statics.length) result.push(statics[i])
  }
  return result
}

export const metadata: Metadata = {
  title: 'Astro Astra - Your Life, Written in the Stars',
  description: 'The most trusted name in the field of Astrology in Nepal.',
}

export default async function HomePage() {
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
      <Header />

      <main>
        <HeroBanner />
        <AboutSection />
        <CategoryStrip />
        <ServicesSection services={interleaveServicesWithStatics(services, STATIC_SERVICE_ITEMS)} variant="section" />
        <ZodiacSection />
        <EventsSection />
        <BookingSection />
        <ReviewsSlider />
        <CtaBanner />
        <BlogSection />
        <FaqSection />
        <SubscribeSection />
      </main>

      <Footer />
      <CartSidebar />
    </>
  )
}
