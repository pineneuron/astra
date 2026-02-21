'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  options?: {
    loop?: boolean;
    margin?: number;
    nav?: boolean;
    dots?: boolean;
    autoplay?: boolean;
    autoplayTimeout?: number;
    autoplayHoverPause?: boolean;
    responsive?: {
      [key: number]: {
        items: number;
      };
    };
  };
}

const Carousel: React.FC<CarouselProps> = ({ children, className = '', options = {} }) => {
  // Convert owl.carousel options to Swiper options
  const swiperOptions = {
    modules: [Autoplay, Navigation, Pagination],
    loop: options.loop ?? true,
    spaceBetween: options.margin ?? 10,
    navigation: options.nav ?? true,
    pagination: options.dots ? { clickable: true } : false,
    autoplay: options.autoplay ? {
      delay: options.autoplayTimeout ?? 3000,
      pauseOnMouseEnter: options.autoplayHoverPause ?? true,
      disableOnInteraction: false,
    } : false,
    breakpoints: options.responsive ? {
      0: {
        slidesPerView: options.responsive[0]?.items ?? 1,
      },
      600: {
        slidesPerView: options.responsive[600]?.items ?? 2,
      },
      1000: {
        slidesPerView: options.responsive[1000]?.items ?? 3,
      },
    } : {
      0: { slidesPerView: 1 },
      600: { slidesPerView: 2 },
      1000: { slidesPerView: 3 },
    },
  };

  // Convert children to array if it's not already
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      <Swiper {...swiperOptions}>
        {childrenArray.map((child, index) => (
          <SwiperSlide key={index}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
