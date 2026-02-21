'use client';

import React, { useState } from 'react';
import Carousel from './Carousel';
import ProductModal from './ProductModal';
import Image from 'next/image';

export interface ProductVariation {
  name: string;
  price: number;
  discountPercent?: number;
}

export interface FrozenProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  discountPercent: number;
  image: string;
  images?: string[];
  shortDescription?: string;
  description?: string;
  variations?: ProductVariation[];
  defaultVariation?: string;
  featured?: boolean;
  bestseller?: boolean;
}

interface FrozenItemsCarouselClientProps {
  products: FrozenProduct[];
}

export default function FrozenItemsCarouselClient({ products }: FrozenItemsCarouselClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<FrozenProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: FrozenProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const options = {
    loop: true,
    margin: 20,
    nav: false,
    dots: false,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1000: { items: 4 }
    }
  };

  return (
    <>
      <Carousel options={options}>
        {products.map((product) => {
          const hasDiscount = product.discountPercent > 0;
          const discountedPrice = hasDiscount
            ? Math.round(product.price * (1 - product.discountPercent / 100))
            : product.price;

          return (
            <div className="item h-full mb-6" key={product.id}>
              <div className="tsf-product_list h-full">
                <figure className="tsf-box-shadow tsf-font-bebas h-full flex flex-col">
                  <div className="tsf-wrapper">
                    <div className="tsf-product-img">
                      <a href="#" onClick={(e) => { e.preventDefault(); handleProductClick(product); }}>
                        <Image src={product.image} alt={product.name}
                          width={384} height={384} className="rounded-t-md cursor-pointer w-full h-auto" />
                      </a>
                    </div>
                  </div>
                  <figcaption className="p-5 text-center rounded-t-md flex flex-col flex-grow">
                    <div className="tsf-product-name">
                      <a
                        className="text-3xl capitalize cursor-pointer"
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleProductClick(product); }}
                      >
                        {product.name}
                      </a>
                    </div>
                    <div className="price text-xl py-4">
                      {hasDiscount ? (
                        <>
                          <span className="pre-price line-through text-gray-400">
                            RS {product.price.toFixed(2)}
                          </span>
                          {' '}
                          <span className="text-red-600 font-bold">
                            RS {discountedPrice.toFixed(2)}
                          </span>
                          {' '}
                          <span className="tsf-discount tsf-bgred-color text-md text-white font-normal rounded-sm p-1 ml-2">
                            {product.discountPercent}%
                          </span>
                        </>
                      ) : (
                        <span>
                          RS {product.price.toFixed(2)}
                        </span>
                      )}
                      {' '}({product.unit})
                    </div>
                    <div className="tsf-add_cart mt-auto pt-2">
                      <button
                        className="tsf-button holographic-card uppercase inline-block text-2xl cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        view details
                      </button>
                    </div>
                  </figcaption>
                </figure>
              </div>
            </div>
          );
        })}
      </Carousel>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </>
  );
}

