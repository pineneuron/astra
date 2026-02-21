'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductModal from './ProductModal';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

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

export interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  products: ProductItem[];
}

interface ProductsCatalogProps {
  categories: Category[];
  initialCategorySlug?: string;
}

type ViewMode = 'grid' | 'list';

export default function ProductsCatalog({ categories, initialCategorySlug }: ProductsCatalogProps) {
  const searchParams = useSearchParams();
  const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
    // Initialize with category from URL if provided
    if (initialCategorySlug) {
      const category = categories.find(cat => cat.slug === initialCategorySlug);
      return category?.id ?? categories[0]?.id ?? '';
    }
    return categories[0]?.id ?? '';
  });
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);
  const hasScrolledToInitialCategory = useRef(false);
  const { addItem } = useCart();

  useEffect(() => {
    function onSetCategory(e: Event) {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        setActiveCategoryId(custom.detail);

        // Scroll to products section if not already visible
        const productHeading = document.querySelector('.tsf-product_heading') as HTMLElement | null;
        const headerEl = document.querySelector('header') as HTMLElement | null;
        const headerHeight = headerEl?.offsetHeight ?? 0;

        if (productHeading) {
          const rect = productHeading.getBoundingClientRect();
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const targetY = rect.top + scrollTop - headerHeight - 20; // 20px extra spacing

          // Only scroll if the section is not already in view
          if (rect.top < headerHeight + 50 || rect.top > window.innerHeight) {
            window.scrollTo({
              top: targetY,
              behavior: 'smooth'
            });
          }
        }
      }
    }
    window.addEventListener('tsf:set-category', onSetCategory as EventListener);
    return () => {
      window.removeEventListener('tsf:set-category', onSetCategory as EventListener);
    };
  }, []);

  useEffect(() => {
    const evt = new CustomEvent('tsf:active-category-changed', { detail: activeCategoryId });
    window.dispatchEvent(evt);
  }, [activeCategoryId]);

  // Handle initial URL query parameter on mount and scroll to category
  useEffect(() => {
    if (hasScrolledToInitialCategory.current) return;

    const categoryParam = searchParams.get('category') || initialCategorySlug;
    if (categoryParam) {
      const category = categories.find(cat => cat.slug === categoryParam);
      if (category) {
        hasScrolledToInitialCategory.current = true;
        isScrollingProgrammatically.current = true;

        // Ensure category is active
        if (category.id !== activeCategoryId) {
          setActiveCategoryId(category.id);
        }

        const scrollToCategory = () => {
          const categorySection = categoryRefs.current[category.id];
          if (categorySection) {
            const stickyCategoryHeight = 80;
            const spacing = 20;
            const sectionRect = categorySection.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const targetY = sectionRect.top + scrollTop - stickyCategoryHeight - spacing;
            
            window.scrollTo({
              top: Math.max(0, targetY),
              behavior: 'smooth'
            });

            setTimeout(() => {
              isScrollingProgrammatically.current = false;
            }, 1000);
            return true;
          }
          return false;
        };

        const tryScroll = (attempt = 0) => {
          if (scrollToCategory()) return;
          if (attempt < 10) {
            setTimeout(() => tryScroll(attempt + 1), 200);
          }
        };

        setTimeout(() => tryScroll(), 300);
      }
    }
  }, [searchParams, categories, initialCategorySlug, activeCategoryId]);

  // Intersection Observer to detect which category is in view
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -60% 0px', // Trigger when category is in upper portion of viewport
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingProgrammatically.current) return;

      // Find all intersecting entries and get the one with highest intersection ratio
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      if (visibleEntries.length === 0) return;

      // Sort by intersection ratio and get the most visible one
      const mostVisible = visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const categoryId = mostVisible.target.getAttribute('data-category-id');

      if (categoryId && categoryId !== activeCategoryId) {
        setActiveCategoryId(categoryId);

        // Scroll the active button into view in the category buttons container
        setTimeout(() => {
          const activeButton = document.querySelector(`[data-tabs-target="#styled-${categoryId}"]`) as HTMLElement;
          const scrollContainer = scrollContainerRef.current;
          if (activeButton && scrollContainer) {
            const buttonRect = activeButton.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            const scrollLeft = scrollContainer.scrollLeft;
            const buttonLeft = buttonRect.left - containerRect.left + scrollLeft;
            const buttonWidth = buttonRect.width;
            const containerWidth = containerRect.width;

            // Center the button in the container
            const targetScroll = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
            scrollContainer.scrollTo({
              left: targetScroll,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all category sections - use a small delay to ensure refs are set
    const timeoutId = setTimeout(() => {
      Object.values(categoryRefs.current).forEach((ref) => {
        if (ref) {
          observer.observe(ref);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [categories, activeCategoryId]);

  function handleProductClick(p: ProductItem) {
    setSelectedProduct(p);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    isScrollingProgrammatically.current = true;

    setTimeout(() => {
      const categorySection = categoryRefs.current[categoryId];
      if (categorySection) {
        const stickyCategoryHeight = 80;
        const spacing = 20;
        const sectionRect = categorySection.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const targetY = sectionRect.top + scrollTop - stickyCategoryHeight - spacing;
        
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      }

      // Reset flag after scrolling completes
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 1000);
    }, 100);
  };

  // Filter products based on search query
  const filterProducts = (products: ProductItem[], query: string): ProductItem[] => {
    if (!query.trim()) return products;
    const lowerQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.shortDescription?.toLowerCase().includes(lowerQuery)
    );
  };

  // Get filtered categories
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) {
      return categories;
    }
    return categories.map(cat => ({
      ...cat,
      products: filterProducts(cat.products, searchQuery)
    })).filter(cat => cat.products.length > 0);
  };

  // Render product card (used in both grid and list views)
  const renderProductCard = (p: ProductItem) => {
    const hasDiscount = p.discountPercent > 0;
    const discountedPrice = hasDiscount
      ? Math.round(p.price * (1 - p.discountPercent / 100))
      : p.price;

    return (
      <div className="tsf-product_list h-full" key={p.id}>
        <figure
          className="tsf-box-shadow tsf-font-bebas h-full flex flex-col cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          onClick={() => handleProductClick(p)}
        >
          <div className="tsf-wrapper relative">
            <div className="tsf-product-img">
              <Image src={p.image} alt={p.name} width={300} height={200} className="rounded-t-md w-full h-auto" />
            </div>
            {/* Cart icon over image on small screens */}
            <div className="tsf-add_cart absolute top-2 right-2 md:hidden">
              <button
                className="holographic-card inline-flex items-center justify-center cursor-pointer w-8 h-8 rounded-full"
                style={{
                  background: '#030E55',
                  color: '#fff',
                  fontWeight: 400
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem({
                    id: p.id,
                    name: p.name,
                    price: p.discountPercent > 0
                      ? Math.round(p.price * (1 - p.discountPercent / 100))
                      : p.price,
                    unit: p.unit,
                    discountPercent: p.discountPercent,
                    image: p.image,
                    variation: p.defaultVariation
                  });
                }}
                aria-label="Add to cart"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            </div>
          </div>
          <figcaption className="p-4 md:p-5 rounded-t-md flex flex-col flex-grow">
            <div className="tsf-product-name text-center">
              <div className="text-[22px] md:text-[26px] capitalize">
                {p.name}
              </div>
            </div>
            {/* Price below image on small screens */}
            <div className="price text-xl font-normal md:hidden mt-2">
              {hasDiscount ? (
                <>
                  <span className="pre-price tsf-text-color tsf-font-bebas line-through">
                    RS {p.price.toFixed(2)}
                  </span>
                  {' '}
                  <span className="text-red-600 font-bold">
                    RS {discountedPrice.toFixed(2)}
                  </span>
                  {' '}
                  <span className="tsf-discount tsf-bgred-color text-md text-white font-normal rounded-sm p-1 ml-2">
                    {p.discountPercent}%
                  </span>
                </>
              ) : (
                <span>
                  RS {p.price.toFixed(2)}
                </span>
              )}
              {' '}({p.unit})
            </div>
            {/* Price and cart at bottom on larger screens */}
            <div className="hidden md:flex items-center justify-between mt-auto pt-2">
              <div className="price text-xl font-normal">
                {hasDiscount ? (
                  <>
                    <span className="pre-price tsf-text-color tsf-font-bebas line-through">
                      RS {p.price.toFixed(2)}
                    </span>
                    {' '}
                    <span className="text-red-600 font-bold">
                      RS {discountedPrice.toFixed(2)}
                    </span>
                    {' '}
                    <span className="tsf-discount tsf-bgred-color text-md text-white font-normal rounded-sm p-1 ml-2">
                      {p.discountPercent}%
                    </span>
                  </>
                ) : (
                  <span>
                    RS {p.price.toFixed(2)}
                  </span>
                )}
                {' '}({p.unit})
              </div>
              <div className="tsf-add_cart">
                <button
                  className="holographic-card inline-flex items-center justify-center cursor-pointer w-10 h-10 rounded-full"
                  style={{
                    background: '#030E55',
                    color: '#fff',
                    fontWeight: 400
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: p.id,
                      name: p.name,
                      price: p.discountPercent > 0
                        ? Math.round(p.price * (1 - p.discountPercent / 100))
                        : p.price,
                      unit: p.unit,
                      discountPercent: p.discountPercent,
                      image: p.image,
                      variation: p.defaultVariation
                    });
                  }}
                  aria-label="Add to cart"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </button>
              </div>
            </div>
          </figcaption>
        </figure>
      </div>
    );
  };

  // Render product in list view
  const renderProductListItem = (p: ProductItem) => {
    const hasDiscount = p.discountPercent > 0;
    const discountedPrice = hasDiscount
      ? Math.round(p.price * (1 - p.discountPercent / 100))
      : p.price;

    return (
      <div key={p.id} className="tsf-product_list h-full">
        <figure
          className="tsf-box-shadow tsf-font-bebas h-full flex flex-row gap-4 p-4 rounded-lg cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-200 relative"
          onClick={() => handleProductClick(p)}
        >
          <div className="tsf-wrapper flex-shrink-0">
            <div className="tsf-product-img w-32 h-32 md:w-40 md:h-40">
              <Image
                src={p.image}
                alt={p.name}
                width={160}
                height={160}
                className="rounded-md w-full h-full object-cover"
              />
            </div>
          </div>
          <figcaption className="flex flex-col flex-grow justify-between py-1 min-w-0">
            <div className="flex-1">
              <div className="tsf-product-name mb-2">
                <div className="text-2xl capitalize line-clamp-2">
                  {p.name}
                </div>
              </div>
              <div className="price text-xl font-normal">
                {hasDiscount ? (
                  <>
                    <span className="pre-price tsf-text-color tsf-font-bebas line-through">
                      RS {p.price.toFixed(2)}
                    </span>
                    {' '}
                    <span className="text-red-600 font-bold">
                      RS {discountedPrice.toFixed(2)}
                    </span>
                    {' '}
                    <span className="tsf-discount tsf-bgred-color text-xs text-white font-normal rounded-sm p-1 ml-1">
                      {p.discountPercent}%
                    </span>
                  </>
                ) : (
                  <span>
                    RS {p.price.toFixed(2)}
                  </span>
                )}
                {' '}({p.unit})
              </div>
            </div>
            <div className="tsf-add_cart mt-3" onClick={(e) => e.stopPropagation()}>
              <button
                className="holographic-card inline-flex items-center justify-center cursor-pointer w-10 h-10 rounded-full"
                style={{
                  background: '#030E55',
                  color: '#fff',
                  fontWeight: 400
                }}
                onClick={(e) => {
                  e.preventDefault();
                  addItem({
                    id: p.id,
                    name: p.name,
                    price: p.discountPercent > 0
                      ? Math.round(p.price * (1 - p.discountPercent / 100))
                      : p.price,
                    unit: p.unit,
                    discountPercent: p.discountPercent,
                    image: p.image,
                    variation: p.defaultVariation
                  });
                }}
                aria-label="Add to cart"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            </div>
          </figcaption>
        </figure>
      </div>
    );
  };

  return (
    <div className="tsf-product_heading" suppressHydrationWarning>
      {/* Search Bar and View Toggle */}
      <div className="w-full max-w-full mx-auto px-4 md:px-6 lg:px-7 mb-6 md:mb-8">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-full px-5 py-2 md:py-2.5 pl-11 tsf-font-sora text-sm md:text-base focus:outline-none focus:border-[#FF4900] bg-white"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 border-2 border-gray-300 rounded-full p-1 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all ${viewMode === 'grid'
                  ? 'bg-[#FF4900] text-white'
                  : 'text-gray-600 hover:text-[#FF4900]'
                }`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-all ${viewMode === 'list'
                  ? 'bg-[#FF4900] text-white'
                  : 'text-gray-600 hover:text-[#FF4900]'
                }`}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category Buttons - Sticky on all devices */}
      <div className="w-full max-w-full mb-10 sticky top-0 z-30 bg-white pt-4 pb-2 px-4 shadow-sm">
        <style dangerouslySetInnerHTML={{
          __html: `
          .category-scroll-container::-webkit-scrollbar {
            height: 3px;
          }
          .category-scroll-container::-webkit-scrollbar-track {
            background: transparent;
          }
          .category-scroll-container::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 2px;
          }
          .category-scroll-container::-webkit-scrollbar-thumb:hover {
            background-color: #94a3b8;
          }
        `}} />
        <div ref={scrollContainerRef} className="w-full pb-2 overflow-x-auto scroll-smooth category-scroll-container" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
          <ul className="flex flex-nowrap justify-center gap-3 text-center min-w-max px-2" role="tablist">
            {categories.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <li key={cat.id} role="presentation" className="flex-shrink-0">
                  <button
                    className={`
                      relative inline-flex items-center justify-center gap-1.5 px-5 py-2 capitalize cursor-pointer tsf-font-sora
                      text-sm font-semibold rounded-full min-w-[100px]
                      transition-all duration-300 ease-in-out transform
                      ${isActive
                        ? 'bg-[#FF4900] text-white'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#FF4900] hover:text-[#FF4900] hover:bg-gray-50 hover:shadow-md active:scale-95'
                      }
                    `}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    data-tabs-target={`#styled-${cat.id}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.icon && (
                      <Image
                        src={cat.icon}
                        alt={cat.name}
                        width={16}
                        height={16}
                        className={`relative z-10 flex-shrink-0 ${isActive ? 'brightness-0 invert' : ''}`}
                      />
                    )}
                    <span className="relative z-10 whitespace-nowrap">{cat.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="w-full max-w-full px-4 md:px-6 lg:px-7 mx-auto">
        {getFilteredCategories().length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 tsf-font-sora">No products found for &quot;{searchQuery}&quot;</p>
            <p className="text-sm text-gray-500 mt-2">Try a different search term</p>
          </div>
        ) : (
          getFilteredCategories().map((cat) => {
            return (
              <div
                key={cat.id}
                id={`styled-${cat.id}`}
                ref={(el) => { categoryRefs.current[cat.id] = el; }}
                data-category-id={cat.id}
                className="block rounded-lg mb-12"
                role="tabpanel"
              >
                <div className="mb-6">
                  <h2 className="text-3xl md:text-4xl font-bold capitalize tsf-font-bebas">
                    {cat.icon && (
                      <span className="inline-flex items-center gap-3">
                        <Image
                          src={cat.icon}
                          alt={cat.name}
                          width={36}
                          height={36}
                          className="flex-shrink-0"
                        />
                        {cat.name}
                      </span>
                    )}
                    {!cat.icon && cat.name}
                  </h2>
                </div>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-stretch">
                    {cat.products.map((p) => renderProductCard(p))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cat.products.map((p) => renderProductListItem(p))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  );
}
