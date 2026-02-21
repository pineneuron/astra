'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductModal from './ProductModal';

export interface ProductVariation {
  name: string;
  price: number;
  discountPercent?: number;
}

export interface ProductItem {
  id: string;
  name: string;
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

const ProductTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bestseller');
  const [bestsellers, setBestsellers] = useState<ProductItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    { id: 'bestseller', label: 'bestseller', content: 'bestseller' },
    { id: 'featured', label: 'featured', content: 'featured' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/highlights', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load highlighted products');
        }
        const data: { bestsellers: ProductItem[]; featured: ProductItem[] } = await response.json();
        setBestsellers(data.bestsellers);
        setFeaturedProducts(data.featured);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to static data if fetch fails
        setBestsellers([]);
        setFeaturedProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const currentProducts = activeTab === 'bestseller'
    ? bestsellers.slice(0, 8)
    : featuredProducts.slice(0, 8);

  const handleProductClick = (product: ProductItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="tsf-product py-20" suppressHydrationWarning>
      <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
        <div className="tsf-product_heading py-10">
          <div className="flex justify-between items-center">
            <div className="mb-4">
              <ul className="flex flex-wrap -mb-px text-3xl font-medium text-center" role="tablist">
                {tabs.map((tab) => (
                  <li key={tab.id} className="me-2" role="presentation">
                    <button
                      className={`inline-block p-4 border-b-2 rounded-t-lg tsf-font-bebas ${
                        activeTab === tab.id
                          ? 'tsf-dark-color border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-600 border-gray-100 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="tsf-all_more text-right">
              <a className="text-3xl capitalize tsf-border_bottom tsf-font-bebas" href="/products">all products</a>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="rounded-lg">
              <div className="grid grid-cols-4 gap-6">
                {currentProducts.map((product) => {
                  const finalPrice = product.discountPercent > 0 
                    ? product.price * (1 - product.discountPercent / 100)
                    : product.price;
                  
                  return (
                    <div key={product.id} className="tsf-product_list">
                      <figure className="tsf-box-shadow tsf-font-bebas">
                        <div className="tsf-wrapper">
                          <div className="tsf-product-img">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleProductClick(product); }}>
                              <Image src={product.image} alt={product.name} width={300} height={200} className="rounded-t-md cursor-pointer" />
                            </a>
                          </div>
                        </div>
                        <figcaption className="p-5 text-center rounded-t-md">
                          <div className="tsf-product-name">
                            <a 
                              className="text-3xl capitalize cursor-pointer" 
                              href="#" 
                              onClick={(e) => { e.preventDefault(); handleProductClick(product); }}
                            >
                              {product.name}
                            </a>
                          </div>
                          <div className="price text-xl font-normal py-4">
                            {product.discountPercent > 0 ? (
                              <>
                                <span className="text-red-600 font-bold">Rs. {finalPrice.toFixed(2)}</span>
                                <span className="line-through text-gray-500 ml-2">Rs. {product.price.toFixed(2)}</span>
                                <span className="tsf-discount tsf-bgred-color text-md text-white font-normal rounded-sm p-1 ml-2">
                                  -{product.discountPercent}%
                                </span>
                              </>
                            ) : (
                              <span className="font-bold">Rs. {product.price.toFixed(2)}</span>
                            )}
                            <span className="block text-sm text-gray-600 mt-1">({product.unit})</span>
                          </div>
                          <div className="tsf-add_cart mt-2">
                            <a 
                              className="tsf-button uppercase inline-block text-2xl cursor-pointer" 
                              href="#"
                              onClick={(e) => { e.preventDefault(); handleProductClick(product); }}
                            >
                              view details
                            </a>
                          </div>
                        </figcaption>
                      </figure>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          isOpen={isModalOpen}
          product={selectedProduct}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ProductTabs;
