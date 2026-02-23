import Link from 'next/link';
import Image from 'next/image';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

const services = [
  { label: 'Training Programs', href: '#' },
  { label: 'Events & Workshops', href: '#' },
  { label: 'Consultancy', href: '#' },
  { label: 'Community Programs', href: '#' },
  { label: 'Online Sessions', href: '#' },
];

const resources = [
  { label: 'Blog / News', href: '#' },
  { label: 'Events Calendar', href: '#' },
  { label: 'Gallery', href: '#' },
  { label: 'Downloads', href: '#' },
  { label: 'FAQs', href: '#' },
];

const quickLinks = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Our Team', href: '#' },
  { label: 'Vision & Mission', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Partners', href: '#' },
];

const socials = [
  { src: '/images/footer-social-fb.svg', alt: 'Facebook', href: '#' },
  { src: '/images/footer-social-x.svg', alt: 'X / Twitter', href: '#' },
  { src: '/images/footer-social-ig.svg', alt: 'Instagram', href: '#' },
  { src: '/images/footer-social-wa.svg', alt: 'WhatsApp', href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative text-white overflow-hidden">
      {/* Background: dark base + leather texture */}
      <div className="absolute inset-0 bg-[#002854]" />
      <Image
        src="/images/footer-bg.svg"
        alt=""
        fill
        className="object-cover opacity-80 pointer-events-none rotate-180 sm:rotate-0"
        aria-hidden
      />

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="relative max-w-[1440px] mx-auto px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr] gap-12">

          {/* Col 1: Logo + tagline + desc + socials */}
          <div className="max-w-[417px]">
            <Image
              src="/images/footer-logo.png"
              alt="Astra"
              width={129}
              height={130}
              className="object-contain mb-5"
            />
            <p className="text-[20px] font-semibold leading-snug mb-4 tsf-font-public-sans">
              Empowering people through quality training
            </p>
            <p className="text-[20px] leading-[30px] mb-6 tsf-font-larken">
              Discover authentic spiritual products and transformative experiences. Begin your journey to inner peace with our curated collection of Rudraksha and healing crystals.
            </p>
            <div className="flex items-center gap-4">
              {socials.map((s) => (
                <a key={s.alt} href={s.href} aria-label={s.alt}>
                  <Image src={s.src} alt={s.alt} width={35} height={35} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h3 className="text-[20px] font-semibold mb-4 tsf-font-public-sans">Services</h3>
            <ul className="space-y-[6px]">
              {services.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[16px] leading-[30px] underline decoration-solid hover:text-amber-300 tsf-font-larken-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h3 className="text-[20px] font-semibold mb-4 tsf-font-public-sans">Resources</h3>
            <ul className="space-y-[6px]">
              {resources.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[16px] leading-[30px] underline decoration-solid hover:text-amber-300 tsf-font-larken-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div>
            <h3 className="text-[20px] font-semibold mb-4 tsf-font-public-sans">Quick Links</h3>
            <ul className="space-y-[6px]">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[16px] leading-[30px] underline decoration-solid hover:text-amber-300 tsf-font-larken-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Payment + tagline band ─────────────────────────────────── */}
      <div className="relative border-t border-white/30">
        <div className="max-w-[1440px] mx-auto px-8 py-8 flex flex-col items-center gap-4 text-center">
          <Image
            src="/images/footer-payment.png"
            alt="PayPal, Visa, Mastercard"
            width={162}
            height={26}
            className="object-contain"
          />
          <p className="text-[14px] leading-[20px] text-white max-w-2xl tsf-font-public-sans">
            We are committed to creating learning-driven, well-managed, and impactful training and events that contribute to individual growth, organizational development, and community improvement.
          </p>
        </div>
      </div>

      {/* ── Copyright bar ─────────────────────────────────────────── */}
      <div className="relative border-t border-white/20">
        <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[12px] text-white tsf-font-public-sans">© 2026 Astra. All Rights Reserved.</p>
          <div className="flex items-center gap-8 text-[12px] text-white tsf-font-public-sans">
            <Link href="#" className="hover:underline">Terms and condition</Link>
            <Link href="#" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>

      <WhatsAppFloatingButton />
    </footer>
  );
}
