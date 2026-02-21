'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface StickyTabMenuProps {
  categories: { id: string; icon: string }[];
}

export default function StickyTabMenu({ categories }: StickyTabMenuProps) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? '');
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    function onActiveChanged(e: Event) {
      const custom = e as CustomEvent<string>;
      if (custom.detail) setActiveId(custom.detail);
    }
    window.addEventListener('tsf:active-category-changed', onActiveChanged as EventListener);
    return () => window.removeEventListener('tsf:active-category-changed', onActiveChanged as EventListener);
  }, []);

  useEffect(() => {
    let ticking = false;

    function updateVisibility() {
      const headerEl = document.querySelector('header') as HTMLElement | null;
      const productSection = document.querySelector('.tsf-our-product') as HTMLElement | null;
      const footerEl = document.querySelector('.tsf-footer') as HTMLElement | null;

      if (!productSection || !footerEl) {
        setVisible(false);
        ticking = false;
        return;
      }

      const scrollTop = window.scrollY;
      const headerHeight = headerEl?.offsetHeight ?? 0;
      const windowHeight = window.innerHeight;

      const rectProduct = productSection.getBoundingClientRect();
      const productTop = rectProduct.top + scrollTop;
      const rectFooter = footerEl.getBoundingClientRect();
      const footerTop = rectFooter.top + scrollTop;

      const isInProductSection = scrollTop >= productTop - headerHeight - 50;
      const isInFooterArea = scrollTop + windowHeight >= footerTop - 100;

      setVisible(isInProductSection && !isInFooterArea);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll);
    // Run once on mount
    updateVisibility();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  function handleClick(id: string) {
    const evt = new CustomEvent('tsf:set-category', { detail: id });
    window.dispatchEvent(evt);
    
    // Scroll to products section
    const productSection = document.querySelector('.tsf-our-product') as HTMLElement | null;
    const headerEl = document.querySelector('header') as HTMLElement | null;
    const headerHeight = headerEl?.offsetHeight ?? 0;
    
    if (productSection) {
      const rect = productSection.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - headerHeight - 20; // 20px extra spacing
      
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    }
  }

  return (
    <div className={`tsf-sticky-tabmenu${visible ? ' show' : ''}`} suppressHydrationWarning>
      <div className="absolute top-[40%] left-4 -translate-y-1/2 z-10">
        <ul className="flex flex-col gap-3" role="tablist">
          {categories.map((c) => {
            const isActive = activeId === c.id;
            return (
              <li key={c.id} role="presentation">
                <button
                  id={`${c.id}-sticky-tab`}
                  className={`
                    relative w-14 h-14 flex items-center justify-center
                    cursor-pointer rounded-full transition-all duration-300
                    ${isActive 
                      ? 'bg-[#FF4900] shadow-lg shadow-[#FF4900]/40 scale-110' 
                      : 'bg-white border-2 border-gray-300 hover:border-[#FF4900] hover:shadow-md hover:scale-105'
                    }
                    tsf-box-shadow
                  `}
                  type="button"
                  role="tab"
                  aria-controls={c.id}
                  aria-selected={isActive}
                  data-tabs-target={`#styled-${c.id}`}
                  onClick={() => handleClick(c.id)}
                >
                  <Image 
                    src={c.icon} 
                    alt={`${c.id}-tab`} 
                    width={30} 
                    height={30}
                    className={isActive ? 'brightness-0 invert' : ''}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
