import Image from 'next/image';
import Link from 'next/link';

const services = [
  { title: 'Vedic Gemstone',         price: '$39', image: '/images/services/svc-gemstone.jpg',   href: '/services/vedic-gemstone'         },
  { title: 'Marriage Compatibility', price: '$99', image: '/images/services/svc-marriage.jpg',   href: '/services/marriage-compatibility'  },
  { title: 'All Remedies',           price: '$39', image: '/images/services/svc-remedies.jpg',   href: '/services/all-remedies'           },
  { title: 'Rudraksha',              price: '$39', image: '/images/services/svc-rudraksha.jpg',  href: '/services/rudraksha'              },
  { title: 'Pitridosha',             price: '$39', image: '/images/services/svc-pitridosha.jpg', href: '/services/pitridosha'             },
  { title: 'Numerology',             price: '$39', image: '/images/services/svc-numerology.jpg', href: '/services/numerology'             },
  { title: 'Birth Chart',            price: '$39', image: '/images/services/svc-birthchart.jpg', href: '/services/birth-chart'            },
  { title: 'Horoscope Matching',     price: '$39', image: '/images/services/svc-horoscope.jpg',  href: '/services/horoscope-matching'     },
];

export default function ServicesSection() {
  return (
    <section className="relative w-full bg-white py-14 overflow-hidden">
      {/* Faint decorative blobs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-[rgba(243,115,53,0.06)] translate-x-1/3 -translate-y-1/3" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 w-[280px] h-[280px] rounded-full bg-[rgba(244,170,54,0.06)]" />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header row */}
        <div className="flex items-center justify-between flex-col lg:flex-row mb-10">
          <h2 className="tsf-font-larken text-black text-[36px]">
            Our Latest Services
          </h2>
          <Link
            href="/services"
            className="flex items-center gap-2 tsf-font-public-sans font-medium text-[16px] text-black hover:opacity-70 transition-opacity"
          >
            View All Services
            <Image src="/images/icon-arrow-right-sm.svg" alt="" width={16} height={10} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {services.map((svc) => (
            <div
              key={svc.title}
              className="bg-white border border-[#b4b9c9] rounded-[4px] overflow-hidden flex flex-col group"
            >
              {/* Image */}
              <div className="relative h-[200px] w-full shrink-0 overflow-hidden">
                <Image
                  src={svc.image}
                  alt={svc.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Wishlist */}
                <button
                  aria-label="Add to wishlist"
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center"
                >
                  <Image src="/images/icon-wishlist.svg" alt="" width={28} height={28} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="tsf-font-larken-medium text-black text-[20px] tracking-[-0.05em] mb-2 leading-snug">
                  {svc.title}
                </h3>

                {/* Price + Stars row */}
                <div className="flex items-center gap-3 mb-4">
                  {/* <span className="tsf-font-public-sans font-semibold text-[#d97706] text-[18px] tracking-[-0.05em]">
                    {svc.price}
                  </span> */}
                  <div className="flex items-center gap-1">
                    <Image src="/images/icon-stars.svg" alt="5 stars" width={80} height={14} />
                    <span className="tsf-font-public-sans text-[#575d73] text-[13px]">(1.5k)</span>
                  </div>
                </div>

                {/* Order Now button */}
                <Link
                  href="#"
                  className="mt-auto flex items-center justify-center h-[46px] rounded-[2px] text-white tsf-font-larken-medium text-[13px] uppercase tracking-wide cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))',
                  }}
                >
                  Order Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
