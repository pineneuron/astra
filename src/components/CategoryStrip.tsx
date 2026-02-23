import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { label: 'Astrology',   image: '/images/categories/cat-astrology.png',  href: '/category/astrology'   },
  { label: 'Crystals',    image: '/images/categories/cat-crystals.png',   href: '/category/crystals'    },
  { label: 'Mantra',      image: '/images/categories/cat-mantra.png',     href: '/category/mantra'      },
  { label: 'Rudraksha',   image: '/images/categories/cat-rudraksha.png',  href: '/category/rudraksha'   },
  { label: 'Palmistry',   image: '/images/categories/cat-palmistry.png',  href: '/category/palmistry'   },
  { label: 'Numerology',  image: '/images/categories/cat-numerology.png', href: '/category/numerology'  },
];

export default function CategoryStrip() {
  return (
    <section
      className="w-full py-10"
      style={{
        background: 'linear-gradient(90deg, rgba(244, 170, 54, 0.18) 0%, rgba(243, 115, 53, 0.18) 100%);',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href="#"
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="tsf-font-larken text-[20px] text-black text-center">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
