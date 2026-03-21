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
    originalPrice: 'NPR. 150000',
    finalPrice: 'NPR. 50,000/-',
    buttonText: 'Book Your Home Visit Today',
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
              {/* Background image - desktop (lg and up) */}
              <Image
                src={slide.image}
                alt=""
                fill
                className="object-cover object-center hidden lg:block"
                priority={i === 0}
              />
              {/* Background image - mobile + tablet (including iPad) */}
              <Image
                src={slide.imageMobile ?? slide.image}
                alt=""
                fill
                className="object-cover object-center lg:hidden"
                priority={i === 0}
              />

              {/* Content */}
              <div className="absolute inset-0 flex items-start pt-12 lg:items-center lg:pt-0">
                <div className="max-w-[1440px] mx-auto px-8 w-full">
                  <div className="max-w-[670px]">
                    <h1 className="tsf-font-larken text-white lg:text-[#0d6800] text-[46px] lg:text-[56px] xl:text-[66px] leading-[1.15] mb-3 whitespace-pre-line font-bold">
                      {slide.heading}
                    </h1>
                    <p className="tsf-font-public-sans text-white lg:text-[#0d6800] text-[16px] lg:text-[20px] leading-[28px] mb-6 max-w-[602px]">
                      {slide.subtext}
                    </p>
                    {slide.originalPrice != null && (
                      <p className="tsf-font-public-sans font-semibold text-[22px] lg:text-[26px] leading-tight mb-3 line-through decoration-red-500 decoration-[3px] text-white lg:text-[#0d6800]">
                        {slide.originalPrice}
                      </p>
                    )}
                    {slide.finalPrice != null && (
                      <div className="mb-10">
                        <div className="inline-flex flex-col items-center justify-center bg-[#c8f5d0] lg:bg-[#0d6800] text-[#0d6800] lg:text-white rounded-xl px-8 py-3 min-w-[220px] lg:min-w-[260px]">
                          <span className="tsf-font-public-sans text-[16px] lg:text-[18px] font-normal leading-tight">
                            Only
                          </span>
                          <span className="tsf-font-larken font-bold text-[28px] lg:text-[34px] leading-tight">
                            {slide.finalPrice}
                          </span>
                        </div>
                      </div>
                    )}
                    <Link
                      href={slide.buttonLink}
                      className="inline-flex items-center gap-3 h-[56px] px-8 rounded-[50px] text-white tsf-font-public-sans text-[18px] font-medium"
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
