'use client';

import { useState } from 'react';
import HomeProducts, { ProductItem } from './HomeProducts';
import Link from 'next/link';

interface HomeProductTabsProps {
  bestsellerProducts: ProductItem[];
  featuredProducts: ProductItem[];
}

export default function HomeProductTabs({ bestsellerProducts, featuredProducts }: HomeProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'bestseller' | 'featured'>('bestseller');

  return (
    <div className="tsf-product py-20">
      <div className="tsf-product_heading py-10">
        <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
          <div className="flex justify-between items-center">
            <div className="mb-4">
              <ul className="flex flex-wrap -mb-px text-3xl font-medium text-center" role="tablist">
                <li className="me-2" role="presentation">
                  <button
                    className={`inline-block p-4 border-b-2 rounded-t-lg tsf-font-bebas ${activeTab === 'bestseller'
                        ? 'tsf-dark-color border-b-2 border-gray-900'
                        : 'text-gray-500 hover:text-gray-600 border-gray-100 hover:border-gray-300'
                      }`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'bestseller'}
                    onClick={() => setActiveTab('bestseller')}
                  >
                    bestseller
                  </button>
                </li>
                <li className="me-2" role="presentation">
                  <button
                    className={`inline-block p-4 border-b-2 rounded-t-lg tsf-font-bebas ${activeTab === 'featured'
                        ? 'tsf-dark-color border-b-2 border-gray-900'
                        : 'text-gray-500 hover:text-gray-600 border-gray-100 hover:border-gray-300'
                      }`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'featured'}
                    onClick={() => setActiveTab('featured')}
                  >
                    featured
                  </button>
                </li>
              </ul>
            </div>
            <div className="tsf-all_more text-right hidden md:block">
              <Link href="/products" className="text-3xl capitalize tsf-border_bottom tsf-font-bebas">all products</Link>
            </div>
          </div>

          <div className="block rounded-lg" role="tabpanel">
            {activeTab === 'bestseller' ? (
              <HomeProducts products={bestsellerProducts} type="bestseller" />
            ) : (
              <HomeProducts products={featuredProducts} type="featured" />
            )}
          </div>
        </div>
      </div>
    </div >
  );
}
