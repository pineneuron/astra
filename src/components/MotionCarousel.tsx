'use client';

import React from 'react';
import Carousel from './Carousel';
import Image from 'next/image';

const MotionCarousel: React.FC = () => {
  const options = {
    loop: true,
    margin: 20,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    items: 3,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1000: { items: 3 }
    }
  };

  return (
    <Carousel options={options}>
      <div className="item">
        <figure className="tsf-box-shadow tsf-font-bebas rounded-md">
          <div className="tsf-motionitem-img">
            <Image src="/images/motion01.svg" alt="motion01" width={320} height={320} />
          </div>
          <figcaption className="p-10 text-center rounded-t-md">
            <div className="tsf-motionitem-name">
              <a className="tsf-button-red uppercase inline-block text-2xl" href="#">add to cart</a>
            </div>
          </figcaption>
        </figure>
      </div>
      <div className="item">
        <figure className="tsf-box-shadow tsf-font-bebas rounded-md">
          <div className="tsf-motionitem-img">
            <Image src="/images/motion02.svg" alt="motion02" width={320} height={320} />
          </div>
          <figcaption className="p-10 text-center rounded-t-md">
            <div className="tsf-motionitem-name">
              <a className="tsf-button-red uppercase inline-block text-2xl" href="#">add to cart</a>
            </div>
          </figcaption>
        </figure>
      </div>
      <div className="item">
        <figure className="tsf-box-shadow tsf-font-bebas rounded-md">
          <div className="tsf-motionitem-img">
            <Image src="/images/motion03.svg" alt="motion03" width={320} height={320} />
          </div>
          <figcaption className="p-10 text-center rounded-t-md">
            <div className="tsf-motionitem-name">
              <a className="tsf-button-red uppercase inline-block text-2xl" href="#">add to cart</a>
            </div>
          </figcaption>
        </figure>
      </div>
    </Carousel>
  );
};

export default MotionCarousel;
