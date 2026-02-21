'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  productCount: number;
}

const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories/summary', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load categories');
        }
        const data: Category[] = await response.json();
        setCategories(data.filter(category => category.productCount > 0));
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  // Category icon mapping - matching the static version
  const getCategoryIcon = (categoryId: string): string => {
    const iconMap: { [key: string]: string } = {
      'chicken': '/images/category04.svg',
      'mutton-buff': '/images/category05.svg',
      'pork': '/images/category02.svg',
      'vegetarian': '/images/category06.svg',
      'fish': '/images/category03.svg',
      'momo': '/images/category02.svg',
      'ready-to-cook': '/images/category01.svg',
      'frozen-snacks': '/images/category06.svg'
    };
    
    return iconMap[categoryId] || '/images/category01.svg';
  };

  // Format category name for display - matching static version
  const formatCategoryName = (name: string): string => {
    const nameMap: { [key: string]: string } = {
      'Chicken Items': 'chicken items',
      'Mutton & Buff Items': 'mutton items',
      'Pork Items': 'pork items',
      'Vegetarian Items': 'frozen momo',
      'Fish Items': 'salami',
      'Mo:Mo & Dumplings': 'frozen momo',
      'Ready to Cook': 'ready to eat',
      'Frozen Snacks': 'burger patty'
    };
    
    return nameMap[name] || name.toLowerCase();
  };

  if (!isClient) {
    // SSR fallback - show loading state
    return (
      <div className="tsf-category relative tsf-bg-primary py-20 mt-20">
        <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
          <div className="tsf-category_heading">
            <h2 className="tsf-dark-color text-4xl font-bold z-10">explore by category</h2>
          </div>
          <div className="grid grid-cols-6 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="tsf-category-item mt-10 text-center">
                <div className="rounded-full bg-gray-200 animate-pulse">
                  <div className="w-15 h-15"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded mt-4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tsf-category relative tsf-bg-primary py-20 mt-20">
      <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
        <div className="tsf-category_heading">
          <h2 className="tsf-dark-color text-4xl font-bold z-10">Explore by Category</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {categories.map((category) => (
            <div key={category.id} className="tsf-category-item basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-[20%] 2xl:basis-1/6 mt-10 text-center">
              <a href={`/products?category=${category.id}`}>
                <div className="rounded-full">
                  <Image 
                    src={getCategoryIcon(category.id)} 
                    alt={category.name} 
                    width={60} 
                    height={60}
                  />
                </div>
                <h3 className="text-2xl font-bold capitalize mt-4">
                  {formatCategoryName(category.name)}
                </h3>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;
