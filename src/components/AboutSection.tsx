import Image from 'next/image';
import Link from 'next/link';

export default function AboutSection() {
  return (
    <section className="w-full max-w-[1200px] mx-auto relative flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-[70px] py-12 md:py-16 lg:py-[111px] px-4 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-[450px] lg:w-[450px] flex items-center justify-center flex-shrink-0">
        <div className="w-full aspect-[9/10] lg:h-[500px] lg:aspect-auto overflow-hidden">
          <Image
            src="/images/about-hero.jpg"
            alt="Crystal and Rudraksha"
            fill
            className="object-cover object-center rounded-[16px] lg:rounded-[20px]"
            sizes="(max-width: 1024px) 100vw, 450px"
          />
        </div>
      </div>

      <div className="relative flex items-center overflow-hidden w-full max-w-[620px] lg:max-w-none">
        <div className="relative z-10 w-full">
          <h2 className="tsf-font-larken-medium text-[#222] text-[24px] sm:text-[26px] lg:text-[30px] leading-tight lg:leading-[45px] mb-4 lg:mb-5">
            About Astrology
          </h2>

          <p className="tsf-font-public-sans text-[#222] text-[16px] sm:text-[17px] lg:text-[18px] leading-[26px] lg:leading-[30px] text-justify mb-4 lg:mb-5">
            Astrology is the ancient science of understanding life through planetary movements and cosmic energies. It reveals insights into your personality, destiny, relationships, career, and spiritual growth by studying the alignment of planets at the time of your birth.
          </p>

          <p className="tsf-font-public-sans text-[#222] text-[16px] sm:text-[17px] lg:text-[18px] leading-[26px] lg:leading-[30px] text-justify mb-6 lg:mb-8">
            Authentic and energized Rudraksha beads sourced from trusted origins. Each Rudraksha is carefully selected and purified to support spiritual growth, peace, and well-being.
          </p>

          {/* Stat */}
          <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
            <span
              className="tsf-font-larken text-[48px] sm:text-[54px] lg:text-[60px] leading-none font-extrabold"
              style={{
                background: 'linear-gradient(to bottom, rgba(244,170,54,0.9), rgba(243,115,53,0.9))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              10+
            </span>
            <div className="tsf-font-public-sans text-black text-[15px] lg:text-[16px] leading-[26px] lg:leading-[28px]">
              <p>Years of</p>
              <p>Experience</p>
            </div>
          </div>

          {/* Button */}
          <Link
            href="#"
            className="inline-flex items-center gap-3 h-[42px] lg:h-[45px] px-6 lg:px-7 rounded-[50px] text-white tsf-font-public-sans text-[15px] lg:text-[16px] cursor-pointer"
            style={{
              background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))',
            }}
          >
            More Detail
          </Link>
        </div>

        <Image
          src="/images/pattern-about.svg"
          alt=""
          fill
          className="absolute top-0 right-0 object-cover object-right-top pointer-events-none opacity-60 lg:opacity-100"
        />
      </div>
    </section>
  );
}
