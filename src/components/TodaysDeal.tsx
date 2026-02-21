'use client';

import { useState, useEffect } from 'react';
import ProductModal from './ProductModal';
import Image from 'next/image';

interface ProductVariation {
  name: string;
  price: number;
  discountPercent?: number;
}

interface DealProduct {
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

// Wrapper component that safely uses cart context
function TodaysDealWithCart({ products }: { products: DealProduct[] }) {
  const [selectedProduct, setSelectedProduct] = useState<DealProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: DealProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <div className="tsf-banner-list rounded-lg">
        <h2 className="tsf-dark-color text-4xl font-bold pb-5">Today&apos;s Deal</h2>
        <div className="tsf-banner-list-item tsf-box-shadow">
          {products.map((product, index) => {
            const hasDiscount = product.discountPercent > 0;
            const discountedPrice = hasDiscount
              ? Math.round(product.price * (1 - product.discountPercent / 100))
              : product.price;
            const isLast = index === products.length - 1;

            return (
              <div 
                key={product.id}
                className={`flex justify-start items-center tsf-font-bebas p-5 ${!isLast ? 'border-b border-gray-200' : ''}`}
              >
                <div className="tsf-product-img">
                  <a href="#" onClick={(e) => { e.preventDefault(); handleProductClick(product); }}>
                    <Image src={product.image} alt={product.name} width={120} height={120} className="rounded-md cursor-pointer" />
                  </a>
                </div>
                <div className="pl-6 flex-1">
                  <div className="tsf-product-name">
                    <a 
                      className="text-2xl font-bold capitalize cursor-pointer hover:text-blue-600" 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handleProductClick(product); }}
                    >
                      {product.name}
                    </a>
                  </div>
                  <div className="price text-md mt-2">
                    {hasDiscount ? (
                      <>
                        <span className="pre-price text-gray-400 line-through">
                          RS {product.price.toFixed(2)}
                        </span>
                        {' '}
                        <span className="text-red-600 font-bold">
                          RS {discountedPrice.toFixed(2)}
                        </span>
                        {' '}
                        <span className="tsf-discount tsf-bgred-color text-sm text-white font-normal rounded-sm p-1 ml-2">
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </>
  );
}

function TodaysDealSkeleton() {
  return (
    <div className="tsf-banner-list rounded-lg">
      <h2 className="tsf-dark-color text-4xl font-bold pb-5">Today&apos;s Deal</h2>
      <div className="tsf-banner-list-item tsf-box-shadow">
        {[1, 2, 3].map((index) => (
          <div 
            key={index}
            className={`flex justify-start items-center p-5 ${index !== 3 ? 'border-b border-gray-200' : ''}`}
          >
            {/* Image skeleton */}
            <div className="tsf-product-img">
              <div className="w-[120px] h-[120px] bg-gray-200 rounded-md animate-pulse" />
            </div>
            {/* Content skeleton */}
            <div className="pl-6 flex-1">
              {/* Product name skeleton */}
              <div className="mb-2">
                <div className="h-7 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
              {/* Price skeleton */}
              <div className="mt-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TodaysDeal: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [dealProducts, setDealProducts] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    
    const loadDealProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/todays-deals');
        
        if (!response.ok) {
          throw new Error('Failed to fetch today\'s deals');
        }
        
        const data = await response.json();
        setDealProducts(data);
      } catch (error) {
        console.error('Error loading deal products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDealProducts();
  }, []);

  if (loading || !isClient) {
    return <TodaysDealSkeleton />;
  }

  // If no products found, show empty state or skeleton
  if (dealProducts.length === 0) {
    return <TodaysDealSkeleton />;
  }

  // After client-side hydration, render with cart functionality
  return <TodaysDealWithCart products={dealProducts} />;
};

export default TodaysDeal;
