'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  variant?: 'home' | 'inner';
}

const navLinks = [
  { href: '/', label: 'HOME' },
  { href: '/about-us', label: 'ABOUT' },
  { href: '/products', label: 'PRODUCTS' },
  { href: '#', label: 'SERVICES' },
  { href: '#', label: 'EVENTS' },
  { href: '/contact', label: 'CONTACT' },
];

const currencies = [
  { code: 'CAD', flag: '🇨🇦', label: 'Canadian Dollar' },
  { code: 'GBP', flag: '🇬🇧', label: 'UK Pound' },
  { code: 'NPR', flag: '🇳🇵', label: 'Nepalese Rupee' },
  { code: 'USD', flag: '🇺🇸', label: 'US Dollar' },
];

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="flex flex-col justify-center gap-1.5 w-6 h-5">
      <span className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-200 origin-center ${open ? 'w-5 rotate-45 translate-y-2' : 'w-5'}`} />
      <span className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-200 ${open ? 'opacity-0 scale-0' : 'w-5'}`} />
      <span className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-200 origin-center ${open ? 'w-5 -rotate-45 -translate-y-2' : 'w-5'}`} />
    </span>
  );
}

export default function Header({ variant = 'home' }: HeaderProps) {
  void variant;
  const pathname = usePathname();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function openCart(e: React.MouseEvent) {
    e.preventDefault();
    // window.dispatchEvent(new CustomEvent('tsf:cart-open'));
  }

  return (
    <header>
      <div className="bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
          <div className="h-[60px] lg:h-[90px] flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="/images/logo-horizontal.svg"
              alt="Astra"
              width={368}
              height={100}
              className="object-contain object-left h-11 sm:h-12 lg:h-14 w-auto max-w-[160px] sm:max-w-[160px] lg:max-w-[220px]"
              priority
            />
          </Link>

            <div className="hidden lg:flex flex-1 justify-center">
              <div className="relative w-full max-w-[529px]">
                <input
                  type="search"
                  placeholder="Search product"
                  className="w-full h-[44px] rounded-[50px] border border-[#b4b9c9] bg-white pl-5 pr-11 text-[15px] text-gray-700 placeholder-[#948d8d] outline-none focus:border-[#f37335]"
                />
                <Image
                  src="/images/icon-search.svg"
                  alt="search"
                  width={16}
                  height={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-5 flex-shrink-0 ml-auto">
              <button type="button" aria-label="Wishlist" className="hidden sm:flex items-center justify-center p-2">
                <Image src="/images/icon-heart.svg" alt="wishlist" width={19} height={18} />
              </button>
              <button type="button" aria-label="Cart" onClick={openCart} className="flex items-center justify-center p-2">
                <Image src="/images/icon-cart.svg" alt="cart" width={20} height={21} />
              </button>
              <button
                type="button"
                aria-label={searchExpanded ? 'Close search' : 'Search'}
                aria-expanded={searchExpanded}
                onClick={() => setSearchExpanded((e) => !e)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Image src="/images/icon-search.svg" alt="" width={20} height={20} />
              </button>
              <button
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors"
              >
                <HamburgerIcon open={menuOpen} />
              </button>
              <Link
                href="/auth/login"
                className="hidden lg:flex items-center gap-2 h-9 lg:h-[40px] px-4 lg:px-5 rounded-[50px] text-white text-sm lg:text-[16px] tsf-font-public-sans whitespace-nowrap"
                style={{ background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }}
              >
                Login
                <Image src="/images/icon-user.svg" alt="" width={10} height={13} aria-hidden />
              </Link>
              <div className="relative hidden lg:block" ref={currencyRef}>
                <button
                  type="button"
                  onClick={() => setCurrencyOpen((v) => !v)}
                  className="flex items-center gap-2 h-9 lg:h-[40px] px-2 lg:px-3 border border-[#b4b9c9] rounded-[3px] bg-white cursor-pointer"
                >
                  {selectedCurrency.flag.startsWith('/') ? (
                    <Image src={selectedCurrency.flag} alt={selectedCurrency.label} width={32} height={16} className="object-cover lg:w-[41px] lg:h-[21px]" />
                  ) : (
                    <span className="text-lg lg:text-xl leading-none">{selectedCurrency.flag}</span>
                  )}
                  <span className="text-[14px] lg:text-[16px] text-black tsf-font-public-sans">{selectedCurrency.code}</span>
                  <Image
                    src="/images/icon-chevron.svg"
                    alt=""
                    width={12}
                    height={8}
                    aria-hidden
                    className={`transition-transform duration-200 ${currencyOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {currencyOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 bg-white border border-[#b4b9c9] rounded-[3px] shadow-lg overflow-hidden">
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { setSelectedCurrency(c); setCurrencyOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 tsf-font-public-sans text-[15px] ${selectedCurrency.code === c.code ? 'bg-amber-50 text-[#f37335]' : 'text-gray-800'
                          }`}
                      >
                        {c.flag.startsWith('/') ? (
                          <Image src={c.flag} alt={c.label} width={28} height={16} className="object-cover rounded-sm flex-shrink-0" />
                        ) : (
                          <span className="text-lg leading-none">{c.flag}</span>
                        )}
                        <span className="font-medium">{c.code}</span>
                        <span className="text-gray-400 text-[12px] truncate">{c.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expandable search row (mobile/tablet): visible when search icon is clicked */}
          <div
            className={`w-full min-w-0 lg:hidden grid transition-[grid-template-rows] duration-200 ease-out ${searchExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="overflow-hidden border-t border-gray-100">
              <div className="px-4 py-3">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search product"
                    className="w-full h-11 rounded-[50px] border border-[#b4b9c9] bg-white pl-4 pr-10 text-[15px] text-gray-700 placeholder-[#948d8d] outline-none focus:border-[#f37335]"
                  />
                  <Image src="/images/icon-search.svg" alt="" width={16} height={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/tablet menu: overlay + slide-out panel (nav only, no search) */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
        <div className={`absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center shrink-0">
              <Image
                src="/images/logo-horizontal.svg"
                alt="Astra"
                width={368}
                height={100}
                className="object-contain object-left h-10 w-auto max-w-[160px]"
              />
            </Link>
            <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
              <HamburgerIcon open />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="py-2">
              {navLinks.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : link.href !== '#' && pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-3 text-[16px] uppercase tracking-wide tsf-font-larken-medium ${isActive ? 'bg-amber-50 text-[#f37335] font-semibold' : 'text-gray-800 hover:bg-gray-50'}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-8 border-t border-gray-200 px-4 space-y-8">
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 w-full justify-center h-11 rounded-[50px] text-white text-[15px] tsf-font-public-sans"
                style={{ background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }}
              >
                Login
                <Image src="/images/icon-user.svg" alt="" width={10} height={13} />
              </Link>
              <div>
                <div className="flex flex-wrap gap-2">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCurrency(c)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm tsf-font-public-sans ${selectedCurrency.code === c.code ? 'border-[#f37335] bg-amber-50 text-[#f37335]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      <span>{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav
        className="hidden lg:flex h-[80px] items-center"
        style={{ background: 'linear-gradient(to right, rgba(243,115,53,0.9), rgba(244,170,54,0.9))' }}
      >
        <div className="max-w-[1440px] mx-auto px-8 w-full flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : link.href !== '#' && pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[16px] uppercase tracking-wide tsf-font-larken-medium transition-opacity ${isActive ? 'text-white font-semibold' : 'text-white/90 hover:text-white'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
