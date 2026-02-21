'use client';

import Carousel from './Carousel';
import Image from 'next/image';

export type TestimonialItem = {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
}

export interface TestimonialCarouselProps {
  items?: TestimonialItem[];
}

const defaultTestimonials: TestimonialItem[] = [
  {
    quote:
      'Best meat products at a great price. The variety of fresh meat they offer is just so good. Best for wholesale as well as retail. I get my supplies here every time.',
    author: 'Aakash SKYmiester',
    avatar: '/images/user01.svg',
  },
  {
    quote:
      'Friendly service and consistently fresh cuts. Their delivery is always on time and the quality never disappoints. Highly recommended for home cooks and restaurants alike.',
    author: 'Anisha Rana',
    avatar: '/images/user01.svg',
  },
  {
    quote:
      'From packaging to taste, everything feels premium. They maintain excellent hygiene standards and the meat stays fresh far longer than other suppliers.',
    author: 'Prabin Maharjan',
    avatar: '/images/user01.svg',
  },
]

const options = {
  loop: true,
  margin: 10,
  nav: false,
  dots: true,
  autoplay: true,
  autoplayTimeout: 5000,
  autoplayHoverPause: true,
  items: 1,
  responsive: {
    0: { items: 1 },
    600: { items: 1 },
    1000: { items: 1 },
  },
  animateOut: 'fadeOut',
  animateIn: 'fadeIn',
}

export default function TestimonialCarousel({ items }: TestimonialCarouselProps) {
  const slides = (items ?? defaultTestimonials).filter((item) => item.quote && item.author)
  const testimonials = slides.length > 0 ? slides : defaultTestimonials

  return (
    <Carousel options={options} className="h-full">
      {testimonials.map((testimonial, index) => (
        <div key={`testimonial-${index}`} className="item h-full">
          <div className="tsf-testimonial-item-list h-full">
            <div className="tsf-testimonial-item-content relative bg-white rounded-md p-10 h-full flex flex-col">
              <div className="tsf-testimonial-item-imgquote">
                <div className="flex items-center justify-start gap-2">
                  {[0, 1, 2, 3].map((star) => (
                    <Image key={star} src="/images/f-star.svg" alt="star" width={16} height={16} className="tsf-star-icon" />
                  ))}
                  <Image src="/images/h-star.svg" alt="star" width={16} height={16} className="tsf-star-icon" />
                </div>
              </div>
              <p className="text-xl text-black mt-6 flex-1">{testimonial.quote}</p>
              <div className="flex items-center gap-3">
                <div className="mt-5">
                  {testimonial.avatar ? (
                    <Image src={testimonial.avatar} alt={testimonial.author} width={48} height={48} className="rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#030e55] text-white text-sm font-semibold">
                      {testimonial.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="mt-5">
                  <h3 className="text-md font-bold text-black tsf-font-sora">{testimonial.author}</h3>
                  {testimonial.role && <p className="text-[12px] text-gray-500">{testimonial.role}</p>}
                </div>
              </div>
              <div className="tsf-testimonial-item-imgquote absolute bottom-5 right-10">
                <Image src="/images/quote.svg" alt="quote" width={80} height={80} className="rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  )
}
