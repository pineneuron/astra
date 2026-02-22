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

// All 12 signs in wheel order (top = Aries, clockwise)
const wheelSigns = [
  '/images/zodiac/aries.svg',
  '/images/zodiac/taurus.svg',
  '/images/zodiac/gemini.svg',
  '/images/zodiac/cancer.svg',
  '/images/zodiac/leo.svg',
  '/images/zodiac/virgo.svg',
  '/images/zodiac/libra.svg',
  '/images/zodiac/scorpio.svg',
  '/images/zodiac/sagittarius.svg',
  '/images/zodiac/capricorn.svg',
  '/images/zodiac/aquarius.svg',
  '/images/zodiac/pisces.svg',
];

function ZodiacWheel() {
  const cx = 210, cy = 210;
  const outerR = 202;   // outermost edge
  const ringOuter = 195; // outer illustration ring boundary
  const ringInner = 100; // inner illustration ring boundary
  const centerR = 74;    // dark center

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Scallop bumps around outer ring (36 bumps, evenly spaced)
  const bumps = Array.from({ length: 36 }, (_, i) => {
    const a = toRad(i * 10);
    return { x: cx + outerR * Math.cos(a), y: cy + outerR * Math.sin(a) };
  });

  // Radial divider lines between 12 sectors
  const dividers = Array.from({ length: 12 }, (_, i) => {
    const a = toRad(i * 30 - 90);
    return {
      x1: cx + ringInner * Math.cos(a),
      y1: cy + ringInner * Math.sin(a),
      x2: cx + ringOuter * Math.cos(a),
      y2: cy + ringOuter * Math.sin(a),
    };
  });

  // Icon positions (center of each 30° sector, at mid-radius)
  const iconR = (ringOuter + ringInner) / 2 - 2;
  const iconSize = 38;
  const icons = wheelSigns.map((src, i) => {
    const a = toRad(i * 30 - 75); // offset by 15° to center within sector
    return {
      src,
      x: cx + iconR * Math.cos(a) - iconSize / 2,
      y: cy + iconR * Math.sin(a) - iconSize / 2,
    };
  });

  return (
    <svg
      viewBox="0 0 420 420"
      width="420"
      height="420"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        {/* Clip to wheel circle */}
        <clipPath id="wheelClip">
          <circle cx={cx} cy={cy} r={ringOuter} />
        </clipPath>
        {/* Golden tint filter for sign icons */}
        <filter id="toGold" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.85
                    0 0 0 0 0.62
                    0 0 0 0 0.10
                    0 0 0 1 0"
          />
        </filter>
      </defs>

      {/* Dark background ring */}
      <circle cx={cx} cy={cy} r={ringOuter} fill="#0e1a35" />

      {/* Subtle star texture dots */}
      {[50, 120, 80, 160, 30, 300, 220, 340].map((a, i) => (
        <circle
          key={i}
          cx={cx + (ringInner + 15 + (i % 3) * 18) * Math.cos(toRad(a + i * 7))}
          cy={cy + (ringInner + 15 + (i % 3) * 18) * Math.sin(toRad(a + i * 7))}
          r="1"
          fill="#c9a227"
          opacity="0.4"
        />
      ))}

      {/* Radial sector dividers */}
      {dividers.map((d, i) => (
        <line key={i} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke="#c9a227" strokeWidth="1.2" opacity="0.7" />
      ))}

      {/* Sign icons inside the annulus ring (golden) */}
      {icons.map((icon, i) => (
        <image
          key={i}
          href={icon.src}
          x={icon.x}
          y={icon.y}
          width={iconSize}
          height={iconSize}
          filter="url(#toGold)"
          opacity="0.9"
        />
      ))}

      {/* Outer ring stroke */}
      <circle cx={cx} cy={cy} r={ringOuter} fill="none" stroke="#c9a227" strokeWidth="3" />

      {/* Scallop bumps on outer edge */}
      {bumps.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="4.5" fill="#c9a227" />
      ))}
      {/* Slightly inset ring line */}
      <circle cx={cx} cy={cy} r={ringOuter - 10} fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.5" />

      {/* Inner golden ring */}
      <circle cx={cx} cy={cy} r={ringInner} fill="none" stroke="#c9a227" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={ringInner - 7} fill="none" stroke="#c9a227" strokeWidth="0.8" opacity="0.5" />

      {/* Center dark circle */}
      <circle cx={cx} cy={cy} r={centerR} fill="#0b1429" />
      <circle cx={cx} cy={cy} r={centerR - 5} fill="none" stroke="#c9a227" strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
      <circle cx={cx} cy={cy} r={centerR - 18} fill="none" stroke="#c9a227" strokeWidth="0.6" opacity="0.35" />
    </svg>
  );
}

function LeftPill({ sign }: { sign: (typeof leftSigns)[0] }) {
  return (
    <Link
      href={`/zodiac/${sign.slug}`}
      className="flex items-center group"
      style={{ marginLeft: `${sign.indent}px` }}
    >
      {/* White circle with sign icon */}
      <div className="relative w-[80px] h-[80px] rounded-full bg-white flex items-center justify-center shrink-0 z-10 shadow-lg transition-transform duration-200 group-hover:scale-105">
        <Image src={sign.icon} alt={sign.name} width={32} height={32} className="object-contain" />
      </div>
      {/* Gradient pill body — overlaps circle by 40px, rounded on right */}
      <div
        className="-ml-[40px] h-[80px] flex flex-col justify-center pl-[48px] pr-5 rounded-r-[10px] w-[200px] shrink-0"
        style={{ background: 'linear-gradient(to bottom, rgba(244,170,54,0.92), rgba(243,115,53,0.92))' }}
      >
        <span className="tsf-font-larken text-white text-[14px] leading-[20px] font-medium">{sign.name}</span>
        <span className="tsf-font-public-sans text-white/85 text-[11px] leading-[17px]">{sign.dates}</span>
      </div>
    </Link>
  );
}

function RightPill({ sign }: { sign: (typeof rightSigns)[0] }) {
  return (
    <Link
      href={`/zodiac/${sign.slug}`}
      className="flex items-center group"
      style={{ marginRight: `${sign.indent}px` }}
    >
      {/* Gradient pill body — rounded on left */}
      <div
        className="-mr-[40px] h-[80px] flex flex-col justify-center pr-[48px] pl-5 rounded-l-[10px] w-[200px] shrink-0 text-right"
        style={{ background: 'linear-gradient(to bottom, rgba(244,170,54,0.92), rgba(243,115,53,0.92))' }}
      >
        <span className="tsf-font-larken text-white text-[14px] leading-[20px] font-medium">{sign.name}</span>
        <span className="tsf-font-public-sans text-white/85 text-[11px] leading-[17px]">{sign.dates}</span>
      </div>
      {/* White circle with sign icon */}
      <div className="relative w-[80px] h-[80px] rounded-full bg-white flex items-center justify-center shrink-0 z-10 shadow-lg transition-transform duration-200 group-hover:scale-105">
        <Image src={sign.icon} alt={sign.name} width={32} height={32} className="object-contain" />
      </div>
    </Link>
  );
}

export default function ZodiacSection() {
  return (
    <section className="relative w-full overflow-hidden py-[70px]">
      {/* Background */}
      <Image src="/images/bg-zodiac.jpg" alt="" fill className="object-cover object-center" priority={false} />
      <div className="absolute inset-0 bg-[#0a1428]/60" />

      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-6">
        {/* Title */}
        <h2 className="tsf-font-larken text-white text-[32px] md:text-[36px] text-center mb-12">
          Choose your Zodiac Sign
        </h2>

        {/* Three-column layout */}
        <div className="flex items-center justify-between">

          {/* Left pills column */}
          <div className="flex flex-col gap-[38px] items-start">
            {leftSigns.map((sign) => (
              <LeftPill key={sign.slug} sign={sign} />
            ))}
          </div>

          {/* Center zodiac wheel */}
          <div className="hidden lg:flex items-center justify-center shrink-0 mx-4">
            <ZodiacWheel />
          </div>

          {/* Right pills column */}
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
