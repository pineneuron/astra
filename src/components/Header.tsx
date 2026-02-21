'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
// import MaintenanceModal from './MaintenanceModal';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useGeneralSettings } from '@/context/GeneralSettingsContext';

interface HeaderProps {
  variant?: 'home' | 'inner';
}

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  unit: string;
  discountPercent: number;
  image: string;
  images: string[];
  shortDescription?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function Header({ variant = 'home' }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useCart();
  const { data: session, status } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const generalSettings = useGeneralSettings();

  const { siteTitle } = generalSettings;
  const logoSrc = '/images/logo.svg';
  const logoAlt = siteTitle ? `${siteTitle} logo` : '3 Star Foods logo';

  const isAdmin = session?.user?.role === 'ADMIN';

  // Calculate total cart count (only after mount to avoid hydration mismatch)
  const cartCount = mounted ? items.reduce((total, item) => total + item.qty, 0) : 0;

  // Get user info for display
  const userName = session?.user?.name || '';
  const userImage = session?.user?.image;
  const firstName = userName.split(' ')[0] || '';
  const firstInitial = firstName.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    setMounted(true);
  }, []);

  const headerClass = 'home relative bg-[#1f2d38] border-b-3 border-[#ff4900] tsf-box-shadow';

  const navLinkClass = 'nav-link text-white capitalize';

  const activeNavLinkClass = 'nav-link active text-white capitalize';

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    const baseClass = isActive ? activeNavLinkClass : navLinkClass;
    const borderClass = isActive ? 'border-[#ff4900]' : 'border-transparent';
    return `${baseClass} border-b-2 ${borderClass} hover:border-[#ff4900] transition-all duration-300 ease-in-out pb-1`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const navIndicator = document.querySelector('.nav-indicator') as HTMLElement;
      if (navIndicator) {
        navIndicator.style.display = 'none';
        void navIndicator.offsetHeight;
        navIndicator.style.display = '';
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  function openCart(e: React.MouseEvent) {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('tsf:cart-open'));
  }

  function handleUserClick(e: React.MouseEvent) {
    e.preventDefault();
    if (status !== 'authenticated') {
      const cb = encodeURIComponent(pathname || '/');
      router.push(`/auth/login?callbackUrl=${cb}`);
      return;
    }
    setUserMenuOpen(v => !v);
  }

  function handleLogout() {
    setUserMenuOpen(false);
    signOut({ callbackUrl: '/' });
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navMenuWrapper = document.querySelector('.nav-menu-wrapper');
    if (menuToggle && navMenu && navMenuWrapper) {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      navMenuWrapper.classList.remove('active');
      setMobileMenuOpen(false);

      // Reset hamburger animation
      const bars = document.querySelectorAll('.bar') as NodeListOf<HTMLElement>;
      if (bars[0]) bars[0].style.transform = 'none';
      if (bars[1]) bars[1].style.opacity = '1';
      if (bars[2]) bars[2].style.transform = 'none';
    }
  };

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navMenuWrapper = document.querySelector('.nav-menu-wrapper');
    
    if (menuToggle && navMenu && navMenuWrapper) {
      const isActive = menuToggle.classList.contains('active');
      
      if (isActive) {
        closeMobileMenu();
      } else {
        menuToggle.classList.add('active');
        navMenu.classList.add('active');
        navMenuWrapper.classList.add('active');
        setMobileMenuOpen(true);

        // Animate hamburger
        const bars = document.querySelectorAll('.bar') as NodeListOf<HTMLElement>;
        if (bars[0]) bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        if (bars[1]) bars[1].style.opacity = '0';
        if (bars[2]) bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
      }
    }
  };

  useEffect(() => {
    // Sync with vanilla JS menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navMenuWrapper = document.querySelector('.nav-menu-wrapper');

    if (menuToggle && navMenu && navMenuWrapper) {
      const handleToggle = () => {
        const isActive = navMenu.classList.contains('active');
        setMobileMenuOpen(isActive);

        // Sync wrapper class
        if (isActive) {
          navMenuWrapper.classList.add('active');
        } else {
          navMenuWrapper.classList.remove('active');
        }
      };

      // Listen for changes
      const observer = new MutationObserver(handleToggle);
      observer.observe(navMenu, { attributes: true, attributeFilter: ['class'] });

      // Initial check
      handleToggle();

      return () => observer.disconnect();
    }
  }, [pathname]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      closeMobileMenu();
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Debounced search using ref to store timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce
  }, [performSearch]);

  // Handle search query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, debouncedSearch]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [searchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  function toggleSearch(e: React.MouseEvent) {
    e.preventDefault();
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }

  function handleSearchProductClick(slug: string) {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/products#${slug}`);
  }

  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <header className={headerClass} suppressHydrationWarning>
        <div className="container-fluid mx-auto px-4 md:px-10">
          {/* <div className="flex justify-between items-center pt-4 pb-14"> */}
          <div className="flex justify-between items-center py-5">
            <div className="hidden md:flex justify-start items-center flex-1">
              {/* Desktop Navigation Menu */}
              <ul className="flex items-center gap-10">
                <li className="nav-item dropdown">
                  <Link 
                    href="/about-us" 
                    className={getLinkClass('/about-us')} 
                    data-index="1"
                  >
                    About
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/products" 
                    className={getLinkClass('/products')} 
                    data-index="0"
                  >
                    Our Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/our-dealers" 
                    className={getLinkClass('/our-dealers')} 
                    data-index="2"
                  >
                    Our Dealers
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/contact" 
                    className={getLinkClass('/contact')} 
                    data-index="4"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="logo-wrap flex justify-center items-center flex-none">
              <Link href="/" className="tsf-logo">
                <Image src={logoSrc} alt={logoAlt} width={120} height={40} className="h-12 w-auto" priority={variant === 'home'} />
              </Link>
            </div>
            <div className="flex-1 flex justify-end items-center gap-6">
              {/* Order Now - Desktop Only */}
              <Link 
                href="/products" 
                className="hidden md:block text-normal font-medium relative text-white pb-0.5 border-b border-dashed border-white/40 hover:opacity-80 transition-opacity"
                style={{
                  textDecoration: 'none',
                }}
              >
                Order Now
              </Link>
              {/* Today's Rate - Desktop Only */}
              <a 
                href="/api/todays-rate" 
                target="_blank" 
                className="hidden md:block text-normal font-medium relative text-white pb-0.5 border-b border-dashed border-white/40 hover:opacity-80 transition-opacity"
                style={{
                  textDecoration: 'none',
                }}
              >
                Today&apos;s Rate
              </a>

              {/* Search Icon - Desktop Only */}
              <button
                onClick={toggleSearch}
                className="hidden md:block relative cursor-pointer"
                aria-label="Search products"
              >
                <Image src="/images/search.svg" alt="search" width={24} height={24} />
              </button>

              {/* Search Input and Dropdown - Desktop Only */}
              {searchOpen && (
                <div className="hidden md:block absolute top-full mt-2 z-50 w-96" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="p-3 border-b border-gray-200">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff4900] focus:border-transparent"
                      />
                    </div>
                    {searchQuery.trim().length >= 2 && (
                      <div ref={searchDropdownRef} className="max-h-96 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500">Searching...</div>
                        ) : searchResults.length > 0 ? (
                          <ul className="py-2">
                            {searchResults.map((product) => (
                              <li key={product.id}>
                                <button
                                  onClick={() => handleSearchProductClick(product.slug)}
                                  className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left cursor-pointer transition-colors"
                                >
                                  <div className="flex-shrink-0">
                                    <Image
                                      src={product.image}
                                      alt={product.name}
                                      width={50}
                                      height={50}
                                      className="rounded object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {product.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {product.category.name}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      {product.salePrice ? (
                                        <>
                                          <span className="text-[#ff4900] font-semibold">
                                            Rs. {product.salePrice.toFixed(2)}
                                          </span>
                                          <span className="text-gray-400 line-through text-sm">
                                            Rs. {product.price.toFixed(2)}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-[#ff4900] font-semibold">
                                          Rs. {product.price.toFixed(2)}
                                        </span>
                                      )}
                                      <span className="text-gray-500 text-sm">/{product.unit}</span>
                                    </div>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No products found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cart and User Icons - Visible on all screens */}
              <a href="#" onClick={openCart} className="relative">
                <Image src="/images/cart.svg" alt="cart" width={24} height={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#ff4900] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </a>

              <div className="relative">
                {status === 'authenticated' ? (
                  <a 
                    href="#" 
                    onClick={handleUserClick} 
                    className="relative flex items-center gap-2 px-2 py-1 rounded-md hover:bg-black/5 transition-colors"
                  >
                    {userImage ? (
                      <Image 
                        src={userImage} 
                        alt={firstName || 'User'} 
                        width={32} 
                        height={32} 
                        className="rounded-full object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-white/20 text-white border-2 border-white/20">
                        {firstInitial}
                      </div>
                    )}
                    <div className="flex flex-col items-start hidden md:flex">
                      <span className="text-xs font-normal text-white/80">
                        My Account
                      </span>
                      {firstName && (
                        <span className="text-xs font-normal text-white">
                          {firstName}
                        </span>
                      )}
                    </div>
                  </a>
                ) : (
                  <a href="#" onClick={handleUserClick} className="relative">
                    <Image src="/images/user.svg" alt="user" width={24} height={24} />
                  </a>
                )}
                {status === 'authenticated' && userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-md shadow-lg ring-1 ring-black/5 z-50 bg-white">
                    <div className="py-2 text-sm">
                      {isAdmin ? (
                        <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100">Admin Dashboard</Link>
                      ) : (
                        <Link href="/account" className="block px-4 py-2 hover:bg-gray-100">My Account</Link>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Wrapper - Separate from desktop */}
              <div className="nav-menu-wrapper md:hidden">
                {/* Mobile Menu Header */}
                <div className="mobile-menu-header md:hidden">
                  <Link href="/" className="mobile-menu-logo" onClick={closeMobileMenu}>
                    <Image src={logoSrc} alt={logoAlt} width={160} height={53} className="h-14 w-auto" />
                  </Link>
                  <button className="mobile-menu-close" onClick={closeMobileMenu} aria-label="Close menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <ul className="nav-menu flex justify-between items-center">
                  {/* Navigation Items */}
                  <li className="nav-item dropdown">
                    <Link href="/about-us" className={getLinkClass('/about-us') + ' pr-8'} data-index="1" onClick={closeMobileMenu}>about</Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/products" className={getLinkClass('/products') + ' pr-8'} data-index="0" onClick={closeMobileMenu}>our
                      products</Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/our-dealers" className={getLinkClass('/our-dealers') + ' pr-8'} data-index="2" onClick={closeMobileMenu}>our
                      dealers</Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/contact" className={getLinkClass('/contact') + ' pr-8'} data-index="4" onClick={closeMobileMenu}>contact</Link>
                  </li>

                  {/* Order Now Button */}
                  <li className="nav-item mobile-menu-button md:hidden">
                    <Link href="/products" className="mobile-todays-rate-btn" onClick={closeMobileMenu}>
                      Order Now
                    </Link>
                  </li>

                  {/* Today's Rate Button */}
                  <li className="nav-item mobile-menu-button md:hidden">
                    <a href="/api/todays-rate" target="_blank" className="mobile-todays-rate-btn" onClick={closeMobileMenu}>
                      Today&apos;s Rate
                    </a>
                  </li>

                  {/* Search Button - Mobile */}
                  <li className="nav-item mobile-menu-button md:hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSearch(e);
                        closeMobileMenu();
                      }}
                      className="mobile-todays-rate-btn w-full"
                    >
                      Search Products
                    </button>
                  </li>
                </ul>
              </div>

              {/* Search Icon - Mobile Only */}
              <button
                onClick={toggleSearch}
                className="md:hidden relative"
                aria-label="Search products"
              >
                <Image src="/images/search.svg" alt="search" width={24} height={24} />
              </button>

              {/* Search Input and Dropdown - Mobile */}
              {searchOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
                    <div className="p-3 border-b border-gray-200 flex items-center gap-2">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff4900] focus:border-transparent"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchOpen(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Close
                      </button>
                    </div>
                    {searchQuery.trim().length >= 2 && (
                      <div ref={searchDropdownRef} className="max-h-96 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500">Searching...</div>
                        ) : searchResults.length > 0 ? (
                          <ul className="py-2">
                            {searchResults.map((product) => (
                              <li key={product.id}>
                                <button
                                  onClick={() => handleSearchProductClick(product.slug)}
                                  className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
                                >
                                  <div className="flex-shrink-0">
                                    <Image
                                      src={product.image}
                                      alt={product.name}
                                      width={50}
                                      height={50}
                                      className="rounded object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {product.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {product.category.name}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      {product.salePrice ? (
                                        <>
                                          <span className="text-[#ff4900] font-semibold">
                                            Rs. {product.salePrice.toFixed(2)}
                                          </span>
                                          <span className="text-gray-400 line-through text-sm">
                                            Rs. {product.price.toFixed(2)}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-[#ff4900] font-semibold">
                                          Rs. {product.price.toFixed(2)}
                                        </span>
                                      )}
                                      <span className="text-gray-500 text-sm">/{product.unit}</span>
                                    </div>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No products found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Menu Toggle (Mobile Only) */}
              <div className="menu-toggle" onClick={toggleMobileMenu}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            </div>
          </div>
        </div>
        {/* <MaintenanceModal /> */}
      </header>
    </>
  );
}
