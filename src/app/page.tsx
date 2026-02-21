import type { Metadata } from 'next'
import Image from 'next/image'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroCarousel from '../components/HeroCarousel'
// import FrozenItemsCarousel from '../components/FrozenItemsCarousel'
import TestimonialCarousel from '../components/TestimonialCarousel'
import FAQAccordion from '../components/FAQAccordion'
import HomeProductTabs from '../components/HomeProductTabs'
import CartSidebar from '../components/CartSidebar'
import TodaysDeal from '../components/TodaysDeal'
import CategoryGridV1 from '../components/CategoryGridV1'
import { Category } from '../components/ProductsCatalog'
import { PageService, ProductService } from '@/lib/services'
import type { ComponentType } from 'react'

const DEFAULT_HOW_TO_ORDER = {
  title: 'how to order?',
  subtitle: "We'll show you stores and restaurants nearby you can order from.",
  steps: [
    {
      title: 'Choose your product',
      description: "We'll show you stores and restaurants nearby you can order from.",
      icon: '/images/order01.svg',
    },
    {
      title: 'Add to cart',
      description: 'Select your preferred cuts, choose the quantity, and add them to your basket.',
      icon: '/images/order02.svg',
    },
    {
      title: 'Place your order',
      description: 'Confirm delivery details and place your order. Fresh products delivered to your door.',
      icon: '/images/order03.svg',
    },
  ] satisfies HowToOrderStepContent[],
}

const DEFAULT_QUALITY = {
  title: 'Quality & innovation',
  subtitle:
    'We are ISO 22000:2018 certified with our own QC laboratory ensuring every product meets strict food safety standards.',
  mainImage: '/images/quality01.svg',
  cards: [
    {
      badge: '01',
      badgeColor: 'tsf-bg-red',
      title: 'ISO & PRE-HACCAP Certification',
      description:
        'We are ISO 22000:2018 Food Safety Certified Company that ensures our products meets international food standards.',
    },
    {
      badge: '02',
      badgeColor: 'tsf-bg-blue',
      title: 'Halal Certification',
      description:
        'Our Company is proudly Halal certified, ensuring that all our Chicken and Mutton products meet the highest standards of Halal integrity.',
    },
    {
      badge: '03',
      badgeColor: 'tsf-bg-secondary',
      title: 'QC Laboratory',
      description:
        'With testing handled by our in-house food technicians we make sure quality product is produced that meets food safety standards.',
    },
    {
      badge: '04',
      badgeColor: 'tsf-bg-primary',
      title: 'Infrastructure',
      description:
        'Our infrastructure ensures the efficient transformation of raw ingredients into nourishing products for our customers.',
    },
  ] satisfies QualityCardContent[],
}

const DEFAULT_TESTIMONIAL_ITEMS: NormalizedTestimonial[] = [
  {
    quote: '5 star for butchery and 2 star for restaurant. This is one of the best and most hygienic meat shops in Kathmandu—I haven’t come across anything better. The variety of fresh and frozen meat products is impressive. They’ve also introduced a deli counter that serves a range of cooked chicken and mutton dishes, perfect for when you’re not in the mood to cook.',
    author: 'Deepak Pokhrel',
    avatar: '/images/user01.svg',
  },
  {
    quote: 'Friendly service and consistently fresh cuts. Their delivery is always on time and the quality never disappoints. Highly recommended for home cooks and restaurants alike.',
    author: 'Anisha Rana',
    avatar: '/images/user01.svg',
  },
]

const DEFAULT_TESTIMONIALS = {
  heading: 'What our customer say',
  leftImage: '/images/testimonial01.svg',
  rightImage: '/images/testimonial02.svg',
  statLabel: 'Satisfied Clients',
  statValue: '99%',
  items: DEFAULT_TESTIMONIAL_ITEMS,
}

const DEFAULT_FAQ_HEADING = 'frequently asked questions.'

type BannerSlideContent = {
  desktopImage?: string
  mobileImage?: string
  url?: string
}

type BannerSlide = {
  id: string
  title?: string
  desktopImage: string
  mobileImage?: string
  url?: string
}

type HowToOrderStepContent = {
  title?: string
  description?: string
  icon?: string
}

type QualityCardContent = {
  badge?: string
  badgeColor?: string
  title?: string
  description?: string
  icon?: string
}

type TestimonialContent = {
  quote?: string
  author?: string
  role?: string
  avatar?: string
}

type NormalizedTestimonial = {
  quote: string
  author: string
  role?: string
  avatar?: string
}

type CmsFAQItem = {
  question?: string
  answer?: string
}

type NormalizedFAQItem = {
  id: string
  question: string
  answer: string
}

type HeroCarouselComponentProps = {
  slides?: BannerSlide[]
}

type TestimonialCarouselComponentProps = {
  items?: NormalizedTestimonial[]
}

type FAQAccordionComponentProps = {
  heading?: string
  items?: NormalizedFAQItem[]
}

type HomeContent = {
  bannerSlides?: BannerSlideContent[]
  howToOrder?: {
    title?: string
    subtitle?: string
    steps: HowToOrderStepContent[]
  }
  qualitySection?: {
    title?: string
    subtitle?: string
    mainImage?: string
    cards: QualityCardContent[]
  }
  testimonialsSection?: {
    heading?: string
    leftImage?: string
    rightImage?: string
    statLabel?: string
    statValue?: string
    items: TestimonialContent[]
  }
  faqHeading?: string
  faqItems?: CmsFAQItem[]
}

function extractArray(source: Record<string, unknown>, key: string) {
  const raw = source[key]
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
}

function extractHomeContent(content: Record<string, unknown> | null | undefined): HomeContent {
  if (!content || typeof content !== 'object') {
    return { howToOrder: { steps: [] }, qualitySection: { cards: [] }, testimonialsSection: { items: [] } }
  }

  const data = content as Record<string, unknown>

  const bannerSlides = extractArray(data, 'bannerSlides').map((item) => ({
    desktopImage: typeof item.desktopImage === 'string' ? item.desktopImage : undefined,
    mobileImage: typeof item.mobileImage === 'string' ? item.mobileImage : undefined,
    url: typeof item.url === 'string' ? item.url : undefined,
  }))

  const howToOrderSteps = extractArray(data, 'howToOrderSteps').map((item) => ({
    title: typeof item.title === 'string' ? item.title : undefined,
    description: typeof item.description === 'string' ? item.description : undefined,
    icon: typeof item.icon === 'string' ? item.icon : undefined,
  }))

  const qualityCards = extractArray(data, 'qualityCards').map((item) => ({
    badge: typeof item.badge === 'string' ? item.badge : undefined,
    badgeColor: typeof item.badgeColor === 'string' ? item.badgeColor : undefined,
    title: typeof item.title === 'string' ? item.title : undefined,
    description: typeof item.description === 'string' ? item.description : undefined,
    icon: typeof item.icon === 'string' ? item.icon : undefined,
  }))

  const testimonialItems = extractArray(data, 'testimonials').map((item) => ({
    quote: typeof item.quote === 'string' ? item.quote : undefined,
    author: typeof item.author === 'string' ? item.author : undefined,
    role: typeof item.role === 'string' ? item.role : undefined,
    avatar: typeof item.avatar === 'string' ? item.avatar : undefined,
  }))

  const faqItems = extractArray(data, 'faqItems').map((item) => ({
    question: typeof item.question === 'string' ? item.question : undefined,
    answer: typeof item.answer === 'string' ? item.answer : undefined,
  }))

  return {
    bannerSlides,
    howToOrder: {
      title: typeof data.howToOrderTitle === 'string' ? data.howToOrderTitle : undefined,
      subtitle: typeof data.howToOrderSubtitle === 'string' ? data.howToOrderSubtitle : undefined,
      steps: howToOrderSteps,
    },
    qualitySection: {
      title: typeof data.qualityTitle === 'string' ? data.qualityTitle : undefined,
      subtitle: typeof data.qualitySubtitle === 'string' ? data.qualitySubtitle : undefined,
      mainImage: typeof data.qualityMainImage === 'string' ? data.qualityMainImage : undefined,
      cards: qualityCards,
    },
    testimonialsSection: {
      heading: typeof data.testimonialHeading === 'string' ? data.testimonialHeading : undefined,
      leftImage: typeof data.testimonialLeftImage === 'string' ? data.testimonialLeftImage : undefined,
      rightImage: typeof data.testimonialRightImage === 'string' ? data.testimonialRightImage : undefined,
      statLabel: typeof data.testimonialStatLabel === 'string' ? data.testimonialStatLabel : undefined,
      statValue: typeof data.testimonialStatValue === 'string' ? data.testimonialStatValue : undefined,
      items: testimonialItems,
    },
    faqHeading: typeof data.faqHeading === 'string' ? data.faqHeading : undefined,
    faqItems,
  }
}

function extractHomeSeo(seo: Record<string, unknown> | null | undefined) {
  if (!seo || typeof seo !== 'object') return {}
  const data = seo as Record<string, unknown>
  return {
    metaTitle: typeof data.metaTitle === 'string' ? data.metaTitle : undefined,
    metaDescription: typeof data.metaDescription === 'string' ? data.metaDescription : undefined,
    ogTitle: typeof data.ogTitle === 'string' ? data.ogTitle : undefined,
    ogDescription: typeof data.ogDescription === 'string' ? data.ogDescription : undefined,
    ogImage: typeof data.ogImage === 'string' ? data.ogImage : undefined,
  }
}

const HeroCarouselWithProps = HeroCarousel as ComponentType<HeroCarouselComponentProps>
const TestimonialCarouselWithProps = TestimonialCarousel as ComponentType<TestimonialCarouselComponentProps>
const FAQAccordionWithProps = FAQAccordion as ComponentType<FAQAccordionComponentProps>

function transformDbToCategory(
  dbCategories: Awaited<ReturnType<typeof ProductService.getAllCategories>>
): Category[] {
  return dbCategories
    .filter((cat) => cat.isActive)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      products: cat.productLinks
        .map((link) => link.product)
        .filter((p) => p.isActive)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.basePrice),
          unit: p.unit,
          discountPercent: p.discountPercent,
          image: p.imageUrl || '/images/placeholder.png',
          images:
            p.images.length > 0
              ? p.images
                .sort((a, b) => (a.isPrimary ? -1 : 0) - (b.isPrimary ? -1 : 0))
                .map((img) => img.imageUrl)
              : undefined,
          shortDescription: p.shortDescription || undefined,
          description: p.description || undefined,
          variations:
            p.variations.length > 0
              ? p.variations.map((v) => ({ name: v.name, price: Number(v.price), discountPercent: v.discountPercent }))
              : undefined,
          defaultVariation: p.variations.find((v) => v.isDefault)?.name || undefined,
          featured: p.isFeatured,
          bestseller: p.isBestseller,
        })),
    }))
    .filter((cat) => cat.products.length > 0)
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await PageService.getPageBySlug('home')
  if (!page || page.status !== 'PUBLISHED') {
    return {
      title: '3 Star Foods',
      description: 'Premium quality meat and food products from 3 Star Foods.',
    }
  }

  const seoRecord =
    page && typeof page.seo === 'object' && page.seo !== null
      ? (page.seo as Record<string, unknown>)
      : undefined
  const seo = extractHomeSeo(seoRecord)

  return {
    title: seo.metaTitle || '3 Star Foods',
    description: seo.metaDescription || 'Premium quality meat and food products from 3 Star Foods.',
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || '3 Star Foods',
      description: seo.ogDescription || seo.metaDescription || 'Premium quality meat and food products from 3 Star Foods.',
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  }
}

export default async function Home() {
  const [page, dbCategories] = await Promise.all([
    PageService.getPageBySlug('home'),
    ProductService.getAllCategories(),
  ])

  const cmsContent =
    page && typeof page.content === 'object' && page.content !== null
      ? (page.content as Record<string, unknown>)
      : undefined

  const homeContent = page && page.status === 'PUBLISHED'
    ? extractHomeContent(cmsContent)
    : { howToOrder: { steps: [] }, qualitySection: { cards: [] }, testimonialsSection: { items: [] } }

  const bannerSlidesSource = (homeContent.bannerSlides ?? [])
    .filter((slide): slide is BannerSlideContent & { desktopImage: string } => Boolean(slide.desktopImage))
    .map((slide, index) => ({
      id: `home-banner-${index}`,
      desktopImage: slide.desktopImage!,
      mobileImage: slide.mobileImage,
      url: slide.url,
    }))
  const bannerSlides = bannerSlidesSource as BannerSlide[]

  const categories = transformDbToCategory(dbCategories)
  const allProducts = categories.flatMap((cat) => cat.products)
  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 8)
  const bestsellerProducts = allProducts.filter((p) => p.bestseller).slice(0, 8)

  const howToOrderStepsSource =
    homeContent.howToOrder?.steps && homeContent.howToOrder.steps.length > 0
      ? homeContent.howToOrder.steps
      : DEFAULT_HOW_TO_ORDER.steps

  const howToOrder = {
    title: homeContent.howToOrder?.title || DEFAULT_HOW_TO_ORDER.title,
    subtitle: homeContent.howToOrder?.subtitle || DEFAULT_HOW_TO_ORDER.subtitle,
    steps: howToOrderStepsSource.map((step, index) => {
      const fallback = DEFAULT_HOW_TO_ORDER.steps[index % DEFAULT_HOW_TO_ORDER.steps.length]
      return {
        title: step.title || fallback.title,
        description: step.description || fallback.description,
        icon: step.icon || fallback.icon,
      }
    }),
  }

  const qualityCardsSource =
    homeContent.qualitySection?.cards && homeContent.qualitySection.cards.length > 0
      ? homeContent.qualitySection.cards
      : DEFAULT_QUALITY.cards

  const qualitySection = {
    title: homeContent.qualitySection?.title || DEFAULT_QUALITY.title,
    subtitle: homeContent.qualitySection?.subtitle || DEFAULT_QUALITY.subtitle,
    mainImage: homeContent.qualitySection?.mainImage || DEFAULT_QUALITY.mainImage,
    cards: qualityCardsSource.map((card, index) => {
      const fallback = DEFAULT_QUALITY.cards[index % DEFAULT_QUALITY.cards.length]
      return {
        badge: card.badge || fallback.badge,
        badgeColor: card.badgeColor || fallback.badgeColor,
        title: card.title || fallback.title,
        description: card.description || fallback.description,
      }
    }),
  }

  const testimonialsSource =
    homeContent.testimonialsSection?.items && homeContent.testimonialsSection.items.length > 0
      ? homeContent.testimonialsSection.items
      : DEFAULT_TESTIMONIAL_ITEMS

  const normalizedTestimonials: NormalizedTestimonial[] = testimonialsSource.flatMap((item, index) => {
    const fallback = DEFAULT_TESTIMONIAL_ITEMS[index % DEFAULT_TESTIMONIAL_ITEMS.length]
    const quote = item.quote ?? fallback.quote
    const author = item.author ?? fallback.author
    if (!quote || !author) {
      return []
    }
    return [
      {
        quote,
        author,
        role: item.role ?? fallback.role,
        avatar: item.avatar ?? fallback.avatar,
      },
    ]
  })

  const testimonialsSection = {
    heading: homeContent.testimonialsSection?.heading || DEFAULT_TESTIMONIALS.heading,
    leftImage: homeContent.testimonialsSection?.leftImage || DEFAULT_TESTIMONIALS.leftImage,
    rightImage: homeContent.testimonialsSection?.rightImage || DEFAULT_TESTIMONIALS.rightImage,
    statLabel: homeContent.testimonialsSection?.statLabel || DEFAULT_TESTIMONIALS.statLabel,
    statValue: homeContent.testimonialsSection?.statValue || DEFAULT_TESTIMONIALS.statValue,
    items: normalizedTestimonials,
  }

  const faqContent = {
    heading: homeContent.faqHeading || DEFAULT_FAQ_HEADING,
    items:
      homeContent.faqItems && homeContent.faqItems.length > 0
        ? homeContent.faqItems
          .map((item, index) => {
            const question = item.question
            const answer = item.answer
            if (!question || !answer) return null
            return {
              id: `faq-${index}`,
              question,
              answer,
            } satisfies NormalizedFAQItem
          })
          .filter((item): item is NormalizedFAQItem => item !== null)
        : [],
  }

  return (
    <>
      <Header variant="home" />

      <div className="tsf-banner relative py-20">
        <div className="w-full max-w-full mx-auto px-4 md:px-10 2xl:max-w-screen-2xl">
          <div className="grid grid-cols-12 gap-8 md:gap-10 items-stretch">
            {bannerSlides.length > 0 && (
              <div className="tsf-slider col-span-12 lg:col-span-9 h-full overflow-hidden" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', paddingRight: '0' }}>
                <div style={{ width: '100%', maxWidth: '100%', height: '100%', overflow: 'hidden' }}>
                  <HeroCarouselWithProps slides={bannerSlides} />
                </div>
            </div>
            )}
            <div className={bannerSlides.length > 0 ? 'col-span-12 lg:col-span-3 h-full' : 'col-span-12 h-full'}>
              <TodaysDeal />
            </div>
          </div>
        </div>
      </div>

      <CategoryGridV1 />

      <HomeProductTabs bestsellerProducts={bestsellerProducts} featuredProducts={featuredProducts} />

      {/* <div className="tsf-frozen pb-20">
        <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
          <div className="tsf-category_heading">
            <h2 className="tsf-dark-color text-4xl font-bold pb-10">Frozen Items</h2>
          </div>
          <div className="tsf-frozen_slider relative carousel-navigation">
            <FrozenItemsCarousel />
          </div>
        </div>
      </div> */}

      <div className="tsf-how_order relative tsf-bg-secondary py-40">
        <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
          <div className="tsf-how-to-order-heading text-center">
            <h2 className="tsf-dark-color text-4xl font-bold uppercase text-white">{howToOrder.title}</h2>
            <p className="text-xl mt-5 text-white">{howToOrder.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 gap-12 mt-20 md:grid-cols-3 md:gap-20">
            {howToOrder.steps.map((step, index) => (
              <div key={`how-step-${index}`} className="tsf-how-to-order-item tsf-box-shadow text-center rounded-md tsf-bg-white p-10">
                <div className="rounded-full tsf-bg-red p-10 inline-flex items-center justify-center">
                  {step.icon ? (
                    <Image src={step.icon} alt={step.title || 'step icon'} width={40} height={40} className="object-contain" />
                  ) : (
                    <span className="text-2xl font-semibold text-white">{index + 1}</span>
                  )}
              </div>
              <div className="mt-10">
                  <h4 className="text-3xl">{step.title}</h4>
                  <p className="pt-2 text-gray-600">{step.description}</p>
            </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tsf-quality py-20">
        <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
          <div className="tsf-how-to-order-heading text-left">
            <h2 className="tsf-dark-color text-4xl font-bold uppercase text-black">{qualitySection.title}</h2>
            {qualitySection.subtitle && <p className="mt-4 text-lg text-gray-600">{qualitySection.subtitle}</p>}
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="tsf-quality-item-left pt-10 md:sticky md:top-20 md:self-start">
              <Image
                src={qualitySection.mainImage}
                alt="quality"
                width={708}
                height={626}
                className="object-cover rounded-md"
              />
            </div>
            <div className="tsf-quality-item-right tsf-bg-gray p-10 mt-10 rounded-md">
              <div className="tsf-quality-item-right-content-list space-y-10">
                {qualitySection.cards.map((card, index) => (
                  <div key={`quality-card-${index}`} className="flex items-start gap-8 border-b border-gray-200 pb-8 last:border-b-0">
                    <div className="tsf-quality-item-right-icon">
                      <span className={`${card.badgeColor || 'tsf-bg-red'} text-white inline-flex h-12 w-12 items-center justify-center rounded-full text-2xl`}>{card.badge || String(index + 1).padStart(2, '0')}</span>
                  </div>
                    <div className="tsf-quality-item-right-content">
                      <h3 className="text-3xl font-bold">{card.title}</h3>
                      {card.description && <p className="text-md mt-2 text-gray-600">{card.description}</p>}
                </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tsf-testimonial relative tsf-bg-blue py-40">
        <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
          <div className="tsf-how-to-order-heading text-left">
            <h2 className="text-white text-4xl font-bold uppercase">{testimonialsSection.heading}</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-0 gap-y-10 items-stretch md:grid-cols-3 md:gap-10">
            <div className="tsf-testimonial-left col-span-2 pt-10 h-full">
              <div className="grid grid-cols-1 gap-10 h-full items-stretch md:grid-cols-3">
                <div className="tsf-testimonial-item-img-left h-full hidden md:flex">
                  <Image
                    src={testimonialsSection.leftImage}
                    alt="testimonial"
                    width={300}
                    height={200}
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 h-full flex">
                  <div className="tsf-testimonial-item-slider relative carousel-navigation h-full w-full">
                    <TestimonialCarouselWithProps items={testimonialsSection.items} />
                  </div>
                </div>
              </div>
            </div>
            <div className="tsf-testimonial-right tsf-bg-red rounded-md p-10">
              <div className="tsf-testimonial-item-img-right">
                <Image
                  src={testimonialsSection.rightImage}
                  alt="testimonial"
                  width={300}
                  height={400}
                  className="object-cover rounded-md m-auto"
                />
              </div>
              <div className="tsf-testimonial-item-content text-center">
                <p className="text-md text-white mt-2 pb-5">{testimonialsSection.statLabel}</p>
                <h3 className="text-6xl font-bold text-white tsf-font-sora">{testimonialsSection.statValue}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {faqContent.items && faqContent.items.length > 0 && (
        <FAQAccordionWithProps heading={faqContent.heading} items={faqContent.items} />
      )}

      <Footer />

      <CartSidebar />
    </>
  )
}
