'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const slides = [
  {
    image: '/images/hero/banner-01.jpg',
    heading: 'The most trusted name\nin the field of Astrology\nin Nepal',
    subtext:
      'Authentic and energized Rudraksha beads sourced from trusted origins. Each Rudraksha is carefully selected and purified to support spiritual growth, peace, and well-being.',
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
            <div className="relative w-full h-[520px] md:h-[620px] lg:h-[720px] overflow-hidden">
              {/* Background image */}
              <Image
                src={slide.image}
                alt=""
                fill
                className="object-cover object-center"
                priority={i === 0}
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-[1200px] mx-auto w-full px-6 lg:px-10">
                  <div className="max-w-[670px]">
                    <h1 className="tsf-font-larken text-white text-[40px] md:text-[52px] lg:text-[65px] leading-[1.15] mb-5 whitespace-pre-line">
                      {slide.heading}
                    </h1>
                    <p className="tsf-font-public-sans text-white text-[16px] md:text-[18px] leading-[28px] mb-8 max-w-[602px] text-justify">
                      {slide.subtext}
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-3 h-[45px] px-6 rounded-[50px] text-white tsf-font-public-sans text-[16px]"
                      style={{
                        background:
                          'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))',
                      }}
                    >
                      View All Product
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
      <div className="absolute bottom-0 left-0 w-full h-3 lg:h-[42.526px] z-10 pointer-events-none">
        <Image
          src="/images/pattern-hero.png"
          alt=""
          width={1440}
          height={44}
          className="w-full h-auto"
        />
      </div>

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
