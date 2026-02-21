import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DealersMap from '../../components/DealersMap';
import DealersList from '../../components/DealersList';
import { PageService } from '@/lib/services';
import Link from "next/link";

type DealerData = {
  id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  coordinates: [number, number];
}

function extractArray(source: Record<string, unknown>, key: string) {
  const value = source[key]
  return Array.isArray(value)
    ? (value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null))
    : []
}

function extractDealersContent(content: Record<string, unknown> | null | undefined) {
  if (!content || typeof content !== 'object') {
    return { heading: 'Find Our Dealers Near You', description: '', dealers: [] }
  }

  const data = content as Record<string, unknown>
  const heading = typeof data.heading === 'string' ? data.heading : 'Find Our Dealers Near You'
  const description = typeof data.description === 'string' ? data.description : 'We have authorized dealers across Nepal to serve you with the freshest meat products. Use the map below to find the nearest dealer in your city.'

  const dealers = extractArray(data, 'dealers')
    .map((item, index) => {
      const name = typeof item.name === 'string' ? item.name : undefined
      const city = typeof item.city === 'string' ? item.city : undefined
      const latitude = typeof item.latitude === 'string' ? parseFloat(item.latitude) : typeof item.latitude === 'number' ? item.latitude : undefined
      const longitude = typeof item.longitude === 'string' ? parseFloat(item.longitude) : typeof item.longitude === 'number' ? item.longitude : undefined

      if (!name || !city || latitude === undefined || longitude === undefined) {
        return null
      }

      return {
        id: `dealer-${index}`,
        name,
        city,
        address: typeof item.address === 'string' ? item.address : undefined,
        phone: typeof item.phone === 'string' ? item.phone : undefined,
        email: typeof item.email === 'string' ? item.email : undefined,
        coordinates: [latitude, longitude] as [number, number],
      } satisfies DealerData
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return { heading, description, dealers }
}

export default async function OurDealersPage() {
  const page = await PageService.getPageBySlug('our-dealers')
  
  const cmsContent =
    page && typeof page.content === 'object' && page.content !== null
      ? (page.content as Record<string, unknown>)
      : undefined

  const dealersContent = page && page.status === 'PUBLISHED'
    ? extractDealersContent(cmsContent)
    : { heading: 'Find Our Dealers Near You', description: 'We have authorized dealers across Nepal to serve you with the freshest meat products. Use the map below to find the nearest dealer in your city.', dealers: [] }

  return (
    <>
      <Header variant="inner" />

      <div className="py-20">
        <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
          <div className="text-center mb-12">
            <h2 className="tsf-dark-color text-4xl font-bold mb-4">{dealersContent.heading}</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {dealersContent.description}
            </p>
          </div>

          {dealersContent.dealers.length > 0 && (
            <>
          <div className="mb-16">
                <DealersMap dealers={dealersContent.dealers} />
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold tsf-font-sora text-gray-800 mb-8 text-center">All Dealers</h3>
                <DealersList dealers={dealersContent.dealers} />
          </div>
            </>
          )}

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold tsf-font-sora text-gray-800 mb-4">Want to Become a Dealer?</h3>
            <p className="text-gray-600 mb-6">
              Join our network of authorized dealers and bring quality meat products to your community.
            </p>
            <Link
              href="/contact"
              className="bg-red-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-red-700 transition-colors"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
