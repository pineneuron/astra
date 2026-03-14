'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const slides = [
  {
    image: '/images/hero/home-vastu-2.svg',
    imageMobile: '/images/hero/home-vastu-mobile.png',
    heading: 'Home Visit and\nConsultation',
    subtext: 'One-on-One Personalized Home Vastu Guidance',
    discount: '50% OFF',
    priceLabel: 'ON',
    price: 'NPR. 100,000',
    buttonText: 'Book a Consultation',
    buttonLink: '/services/home-vastu/book',
  },
];

export default function HeroBanner() {
  return (
    <section className="relative w-full">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          bulletClass: 'hero-bullet',
          bulletActiveClass: 'hero-bullet-active',
        }}
        loop
        className="hero-swiper"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative w-full h-[calc(100vh-60px)] lg:h-[calc(100vh-146px)] overflow-hidden">
              {/* Background image - desktop */}
              <Image
                src={slide.image}
                alt=""
                fill
                className="object-cover object-center hidden md:block"
                priority={i === 0}
              />
              {/* Background image - mobile */}
              <Image
                src={slide.imageMobile ?? slide.image}
                alt=""
                fill
                className="object-cover object-center md:hidden"
                priority={i === 0}
              />

              {/* Content */}
              <div className="absolute inset-0 flex items-start pt-12 md:items-center md:pt-0">
                <div className="max-w-[1440px] mx-auto px-8 w-full">
                  <div className="max-w-[670px]">
                    <h1 className="tsf-font-larken text-white md:text-[#0d6800] text-[46px] md:text-[56px] lg:text-[66px] leading-[1.15] mb-3 whitespace-pre-line font-bold">
                      {slide.heading}
                    </h1>
                    <p className="tsf-font-public-sans text-white md:text-[#0d6800] text-[16px] md:text-[20px] leading-[28px] mb-6 max-w-[602px]">
                      {slide.subtext}
                    </p>
                    {slide.discount != null && (
                      <div className="mb-6 flex flex-wrap items-baseline gap-3">
                        <div className="tsf-font-larken text-white md:text-[#0d6800] font-bold text-[34px] md:text-[42px] leading-tight">
                          {slide.discount.split(' ').filter(Boolean).map((part, j) => (
                            <span key={j} className="block">{part}</span>
                          ))}
                        </div>
                        {slide.priceLabel != null && (
                          <span className="tsf-font-public-sans text-white md:text-[#0d6800] text-[18px] md:text-[22px]">
                            {slide.priceLabel}
                          </span>
                        )}
                        {slide.price != null && (
                          <span className="inline-block bg-[#98e6a0] md:bg-[#0d6800] text-[#0d6800] md:text-white tsf-font-public-sans font-semibold text-[16px] md:text-[20px] px-4 py-2 rounded-lg">
                            {slide.price}
                          </span>
                        )}
                      </div>
                    )}
                    <Link
                      href={slide.buttonLink}
                      className="inline-flex items-center gap-3 h-[48px] px-7 rounded-[50px] text-white tsf-font-public-sans text-[16px] font-medium"
                      style={{
                        background:
                          'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))',
                      }}
                    >
                      {slide.buttonText}
                      <Image
                        src="/images/hero-arrow-btn.svg"
                        alt=""
                        width={32}
                        height={32}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Torn bottom edge */}
      {/* <div className="absolute bottom-0 left-0 w-full h-3 lg:h-[42.526px] z-10 pointer-events-none">
        <Image
          src="/images/pattern-hero.png"
          alt=""
          width={1440}
          height={44}
          className="w-full h-auto"
        />
      </div> */}

      <style>{`
        .hero-swiper { width: 100%; }
        .hero-swiper .swiper-pagination {
          bottom: 10px;
          z-index: 20;
        }
        .hero-bullet {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
          margin: 0 5px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .hero-bullet-active {
          background: linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9));
          width: 30px;
          border-radius: 6px;
        }
      `}</style>
    </section>
  );
}
