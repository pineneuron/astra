import Image from 'next/image';
import Link from 'next/link';

export default function CtaBanner() {
  return (
    <section className="relative w-full min-h-[280px] sm:min-h-[320px] flex items-center justify-center overflow-hidden py-16 sm:py-20">
      <Image
        src="/images/cta-bg.jpg"
        alt=""
        fill
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 text-center px-4 max-w-[650px] mx-auto">
        <h2 className="tsf-font-larken text-white text-[28px] sm:text-[34px] lg:text-[40px] leading-tight mb-3">
          Explore Sacred Rudraksha & More
        </h2>
        <p className="tsf-font-public-sans text-white/90 text-[16px] sm:text-[18px] leading-relaxed mb-8">
          Discover authentic pieces for spiritual growth and well-being.
        </p>
        <Link
          href="#"
          className="inline-flex items-center gap-3 h-[44px] pl-6 pr-2 rounded-[27px] text-white tsf-font-larken-medium text-[16px] tracking-[-0.05em] cursor-pointer transition-opacity hover:opacity-95"
          style={{ background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }}
        >
          Shop Now
          <span className="flex items-center justify-center w-8 h-8 shrink-0">
            <Image src="/images/icon-arrow-brown.svg" alt="" width={32} height={32} />
          </span>
        </Link>
      </div>
    </section>
  );
}
