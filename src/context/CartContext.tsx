'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  discountPercent: number;
  image: string;
  variation?: string;
}

export interface CartLineItem extends CartProduct {
  qty: number;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
}

interface CartContextValue {
  items: CartLineItem[];
  appliedCoupon: AppliedCoupon | null;
  isHydrated: boolean;
  addItem: (product: CartProduct, qty?: number) => void;
  removeItem: (id: string, variation?: string) => void;
  increment: (id: string, variation?: string) => void;
  decrement: (id: string, variation?: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string; coupon?: Coupon }>;
  removeCoupon: () => void;
  subtotal: number;
  total: number;
  discountAmount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// Helper function to load cart from localStorage (SSR-safe)
function loadCartFromStorage(): { items: CartLineItem[]; appliedCoupon: AppliedCoupon | null } {
  if (typeof window === 'undefined') {
    return { items: [], appliedCoupon: null };
  }
  
  try {
    const savedCart = localStorage.getItem('tsf-cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      return {
        items: parsed.items || [],
        appliedCoupon: parsed.appliedCoupon || null
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  
  return { items: [], appliedCoupon: null };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage synchronously (SSR-safe)
  const initialState = loadCartFromStorage();
  const [items, setItems] = useState<CartLineItem[]>(initialState.items);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(initialState.appliedCoupon);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with localStorage on client mount (handles hydration and ensures latest data)
  useEffect(() => {
    const saved = loadCartFromStorage();
    setItems(saved.items);
    setAppliedCoupon(saved.appliedCoupon);
    // Mark as hydrated so components know cart is ready
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever items or appliedCoupon changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tsf-cart', JSON.stringify({ items, appliedCoupon }));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items, appliedCoupon]);

  function addItem(product: CartProduct, qty: number = 1) {
    setItems(prev => {
      // Create a unique key that includes both product ID and variation
      const uniqueKey = product.variation ? `${product.id}-${product.variation}` : product.id;
      const existing = prev.find(p => {
        const pKey = p.variation ? `${p.id}-${p.variation}` : p.id;
        return pKey === uniqueKey;
      });
      
      if (existing) {
        return prev.map(p => {
          const pKey = p.variation ? `${p.id}-${p.variation}` : p.id;
          return pKey === uniqueKey ? { ...p, qty: p.qty + qty } : p;
        });
      }
      return [...prev, { ...product, qty }];
    });
  }

  function removeItem(id: string, variation?: string) {
    setItems(prev => {
      if (variation) {
        return prev.filter(p => !(p.id === id && p.variation === variation));
      }
      return prev.filter(p => p.id !== id);
    });
  }

  function increment(id: string, variation?: string) {
    setItems(prev => prev.map(p => {
      if (variation) {
        return (p.id === id && p.variation === variation) ? { ...p, qty: p.qty + 1 } : p;
      }
      return p.id === id ? { ...p, qty: p.qty + 1 } : p;
    }));
  }

  function decrement(id: string, variation?: string) {
    setItems(prev => prev.map(p => {
      if (variation) {
        return (p.id === id && p.variation === variation) ? { ...p, qty: Math.max(1, p.qty - 1) } : p;
      }
      return p.id === id ? { ...p, qty: Math.max(1, p.qty - 1) } : p;
    }));
  }

  function clear() {
    setItems([]);
    setAppliedCoupon(null);
    // Also clear from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('tsf-cart');
      } catch (error) {
        console.error('Error clearing cart from localStorage:', error);
      }
    }
  }

  async function applyCoupon(code: string): Promise<{ success: boolean; message: string; coupon?: Coupon }> {
    try {
      const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
      
      const response = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: subtotal })
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, message: data.message };
      }

      // Convert API response to match Coupon interface
      const coupon: Coupon = {
        id: data.coupon.id,
        code: data.coupon.code,
        name: data.coupon.name,
        description: data.coupon.description || '',
        type: data.coupon.type === 'PERCENTAGE' ? 'percentage' : 'flat',
        value: data.coupon.value,
        minOrderAmount: data.coupon.minOrderAmount,
        maxDiscountAmount: data.coupon.maxDiscountAmount || 0,
        startDate: data.coupon.startDate,
        endDate: data.coupon.endDate,
        isActive: data.coupon.isActive,
        usageLimit: data.coupon.usageLimit || 0,
        usedCount: data.coupon.usedCount
      };

      setAppliedCoupon({ coupon, discountAmount: data.discountAmount });
      return { success: true, message: data.message || 'Coupon applied successfully!', coupon };
    } catch (error) {
      console.error('Coupon validation error:', error);
      return { success: false, message: 'Error applying coupon. Please try again.' };
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
  }

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price * it.qty, 0), [items]);
  const discountAmount = useMemo(() => appliedCoupon?.discountAmount || 0, [appliedCoupon]);
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  const value: CartContextValue = {
    items,
    appliedCoupon,
    isHydrated,
    addItem,
    removeItem,
    increment,
    decrement,
    clear,
    applyCoupon,
    removeCoupon,
    subtotal,
    total,
    discountAmount
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
