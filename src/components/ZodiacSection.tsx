'use client';
import Image from 'next/image';
import Link from 'next/link';

// Left column signs with arc indent (px from container-left → creates curve toward wheel)
// Positive = indent inward, negative = extends beyond container edge
const leftSigns = [
  { name: 'Mesh (Aries)',      dates: 'March 11 - April 19', icon: '/images/zodiac/aries.svg',       slug: 'aries',       indent: 64  },
  { name: 'Vrishabh (Taurus)', dates: 'April 20 - May 20',   icon: '/images/zodiac/taurus.svg',      slug: 'taurus',      indent: 14  },
  { name: 'Mithun (Gemini)',   dates: 'May 21 - June 20',    icon: '/images/zodiac/gemini.svg',      slug: 'gemini',      indent: -16 },
  { name: 'Karka (Cancer)',    dates: 'June21 - July 22',    icon: '/images/zodiac/cancer.svg',      slug: 'cancer',      indent: -16 },
  { name: 'Simha (Leo)',       dates: 'July 23 - Aug 22',    icon: '/images/zodiac/leo.svg',         slug: 'leo',         indent: 14  },
  { name: 'Kanya (Virgo)',     dates: 'Aug 23 - Sept 22',    icon: '/images/zodiac/virgo.svg',       slug: 'virgo',       indent: 64  },
];

const rightSigns = [
  { name: 'Tula (Libra)',           dates: 'Sept 23 - Oct 22', icon: '/images/zodiac/libra.svg',       slug: 'libra',       indent: 64  },
  { name: 'Vrikshika (Scorpio)',    dates: 'Oct 23 - Nov 21',  icon: '/images/zodiac/scorpio.svg',     slug: 'scorpio',     indent: 14  },
  { name: 'Dhanush (Sagittarius)', dates: 'Nov 22 - Dec 21',  icon: '/images/zodiac/sagittarius.svg', slug: 'sagittarius', indent: -16 },
  { name: 'Makar (Capricorn)',      dates: 'Dec 22 - Jan 19',  icon: '/images/zodiac/capricorn.svg',   slug: 'capricorn',   indent: -16 },
  { name: 'Kumbh (Aquarius)',       dates: 'Jan 20 - Feb 18',  icon: '/images/zodiac/aquarius.svg',    slug: 'aquarius',    indent: 14  },
  { name: 'Meena (Pisces)',         dates: 'Feb 19 - Mar 20',  icon: '/images/zodiac/pisces.svg',      slug: 'pisces',      indent: 64  },
];

const allSigns = [...leftSigns, ...rightSigns];

function LeftPill({ sign, noIndent }: { sign: (typeof leftSigns)[0]; noIndent?: boolean }) {
  return (
    <Link
      href="#"
      className={`flex items-center group cursor-pointer ${noIndent ? 'w-full justify-start' : 'justify-center'}`}
      style={noIndent ? undefined : { marginLeft: `${sign.indent}px` }}
    >
      <div className="relative w-14 h-14 sm:w-[80px] sm:h-[80px] rounded-full bg-white flex items-center justify-center shrink-0 z-10 shadow-lg transition-transform duration-200 group-hover:scale-105">
        <Image src={sign.icon} alt={sign.name} width={32} height={32} className="object-contain w-7 h-7 sm:w-8 sm:h-8" />
      </div>
      <div
        className={`-ml-7 sm:-ml-[40px] h-14 sm:h-[80px] flex flex-col justify-center pl-10 sm:pl-[48px] pr-3 sm:pr-5 rounded-r-[10px] shrink-0 ${noIndent ? 'flex-1 min-w-0' : 'w-[160px] sm:w-[200px]'}`}
        style={{ background: 'linear-gradient(to bottom, rgba(244,170,54,0.92), rgba(243,115,53,0.92))' }}
      >
        <span className="tsf-font-larken text-white text-[12px] sm:text-[14px] leading-[18px] sm:leading-[20px] font-medium">{sign.name}</span>
        <span className="tsf-font-public-sans text-white/85 text-[10px] sm:text-[11px] leading-[14px] sm:leading-[17px]">{sign.dates}</span>
      </div>
    </Link>
  );
}

function RightPill({ sign }: { sign: (typeof rightSigns)[0] }) {
  return (
    <Link
      href="#"
      className="flex items-center justify-center group cursor-pointer"
      style={{ marginRight: `${sign.indent}px` }}
    >
      <div
        className="-mr-7 sm:-mr-[40px] h-14 sm:h-[80px] flex flex-col justify-center pr-10 sm:pr-[48px] pl-3 sm:pl-5 rounded-l-[10px] w-[160px] sm:w-[200px] shrink-0 text-right"
        style={{ background: 'linear-gradient(to bottom, rgba(244,170,54,0.92), rgba(243,115,53,0.92))' }}
      >
        <span className="tsf-font-larken text-white text-[12px] sm:text-[14px] leading-[18px] sm:leading-[20px] font-medium">{sign.name}</span>
        <span className="tsf-font-public-sans text-white/85 text-[10px] sm:text-[11px] leading-[14px] sm:leading-[17px]">{sign.dates}</span>
      </div>
      <div className="relative w-14 h-14 sm:w-[80px] sm:h-[80px] rounded-full bg-white flex items-center justify-center shrink-0 z-10 shadow-lg transition-transform duration-200 group-hover:scale-105">
        <Image src={sign.icon} alt={sign.name} width={32} height={32} className="object-contain w-7 h-7 sm:w-8 sm:h-8" />
      </div>
    </Link>
  );
}

export default function ZodiacSection() {
  return (
    <section className="relative w-full overflow-hidden py-10 sm:py-14 lg:py-[70px]">
      <Image src="/images/bg-zodiac.jpg" alt="" fill className="object-cover object-center" priority={false} />
      <div className="absolute inset-0 bg-[#0a1428]/60" />

      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-6">
        <h2 className="tsf-font-larken text-white text-[26px] sm:text-[30px] lg:text-[36px] text-center mb-8 lg:mb-12">
          Choose your Zodiac Sign
        </h2>

        {/* Mobile/tablet: wheel + grid of pills — full width with padding */}
        <div className="flex flex-col items-center gap-8 lg:hidden w-full">
          <div className="w-full aspect-square flex items-center justify-center shrink-0">
            <div className="w-full h-full animate-[spin_45s_linear_infinite]">
              <Image src="/images/zodiac-wheel.png" alt="Zodiac Wheel" width={627.22} height={623.6} className="object-contain w-full h-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full sm:max-w-xl sm:mx-auto">
            {allSigns.map((sign) => (
              <LeftPill key={sign.slug} sign={{ ...sign, indent: 0 }} noIndent />
            ))}
          </div>
        </div>

        {/* Desktop: three-column layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex flex-col gap-[38px] items-start">
            {leftSigns.map((sign) => (
              <LeftPill key={sign.slug} sign={sign} />
            ))}
          </div>
          <div className="flex items-center justify-center shrink-0 mx-4 w-[420px] h-[420px]">
            <div className="w-full h-full animate-[spin_45s_linear_infinite]">
              <Image src="/images/zodiac-wheel.png" alt="Zodiac Wheel" width={627.22} height={623.6} className="object-contain w-full h-full" />
            </div>
          </div>
          <div className="flex flex-col gap-[38px] items-end">
            {rightSigns.map((sign) => (
              <RightPill key={sign.slug} sign={sign} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
