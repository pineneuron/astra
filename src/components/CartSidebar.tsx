'use client';

import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation'; // Temporarily disabled for checkout
import { useCart } from '../context/CartContext';
import Image from 'next/image';

interface CartSidebarProps {
  initialOpen?: boolean;
}

// Configurable order rules
const MIN_ORDER_AMOUNT = 2000; // Rs.
const DELIVERY_FEE = 150;      // Rs. applied when subtotal < MIN_ORDER_AMOUNT

export default function CartSidebar({ initialOpen = false }: CartSidebarProps) {
  // const router = useRouter(); // Temporarily disabled for checkout
  const [open, setOpen] = useState<boolean>(initialOpen);
  const [mounted, setMounted] = useState(false);
  const { 
    items, 
    increment, 
    decrement, 
    removeItem, 
    subtotal, 
    total, 
    discountAmount, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon
  } = useCart();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Only render cart content after client-side hydration to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function toggle(e: Event) {
      const ev = e as CustomEvent<boolean | undefined>;
      if (typeof ev.detail === 'boolean') setOpen(ev.detail);
      else setOpen(prev => !prev);
    }
    function openEv() { setOpen(true); }
    function closeEv() { setOpen(false); }
    window.addEventListener('tsf:cart-toggle', toggle as EventListener);
    window.addEventListener('tsf:cart-open', openEv as EventListener);
    window.addEventListener('tsf:cart-close', closeEv as EventListener);
    return () => {
      window.removeEventListener('tsf:cart-toggle', toggle as EventListener);
      window.removeEventListener('tsf:cart-open', openEv as EventListener);
      window.removeEventListener('tsf:cart-close', closeEv as EventListener);
    };
  }, []);

  // Disable body scroll when cart is open
  useEffect(() => {
    if (open) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position when cart closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // Only check items after mount to avoid hydration mismatch
  const hasItems = mounted ? items.length > 0 : false;
  const belowMinimum = mounted ? total < MIN_ORDER_AMOUNT : false;
  const deliveryFeeApplied = hasItems && belowMinimum ? DELIVERY_FEE : 0;
  const grandTotal = mounted ? total + deliveryFeeApplied : 0;
  const amountToReachMinimum = mounted ? Math.max(0, MIN_ORDER_AMOUNT - total) : MIN_ORDER_AMOUNT;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: 'error', text: 'Please enter a coupon code' });
      return;
    }

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const result = await applyCoupon(couponCode.trim());
      setCouponMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
      
      if (result.success) {
        setCouponCode('');
      }
    } catch {
      setCouponMessage({ type: 'error', text: 'Error applying coupon. Please try again.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage(null);
  };

  // Checkout temporarily disabled
  // const handleCheckout = () => {
  //   setOpen(false);
  //   router.push('/checkout');
  // };

  return (
    <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-[420px] max-w-[90vw] flex flex-col justify-between bg-white tsf-box-shadow transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold tsf-font-sora uppercase">Your Cart</h3>
          <button aria-label="Close" className="w-10 h-10 rounded-full tsf-bg-red text-white flex items-center justify-center" onClick={() => setOpen(false)}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {hasItems ? (
            items.map((it, idx) => (
              <div key={`${it.id}-${it.variation || 'default'}`} className={`flex items-start gap-4 p-6 ${idx !== 0 ? 'border-t' : ''}`}>
                <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={it.image} alt={it.name} width={96} height={96} className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold tsf-font-sora uppercase">{it.name}</h4>
                      {it.variation && (
                        <p className="text-xs text-blue-600 font-medium mt-1">Variation: {it.variation}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">RS {it.price.toFixed(2)}</p>
                    </div>
                    <button aria-label="Remove" className="text-gray-400 hover:text-black" onClick={() => removeItem(it.id, it.variation)}>×</button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="w-8 h-8 rounded-full border" onClick={() => decrement(it.id, it.variation)}>-</button>
                    <span className="w-8 text-center">{it.qty}</span>
                    <button className="w-8 h-8 rounded-full border" onClick={() => increment(it.id, it.variation)}>+</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">🛒</div>
                <h4 className="text-md font-semibold tsf-font-sora">Your cart is empty</h4>
                <p className="text-sm text-gray-500 mt-1">Add items to get started.</p>
              </div>
            </div>
          )}
        </div>

        {hasItems && (
          <div className="sticky bottom-0 bg-white border-t p-6 space-y-3">
            {belowMinimum && (
              <div className="rounded-md bg-yellow-50 text-yellow-800 text-sm p-3">
                Add <span className="font-semibold">Rs. {amountToReachMinimum.toFixed(2)}</span> more to reach the minimum order amount (Rs. {MIN_ORDER_AMOUNT}). You can still checkout now; a delivery fee applies.
              </div>
            )}
            
            {/* Coupon Section */}
            <div className="space-y-2">
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {appliedCoupon.coupon.name} ({appliedCoupon.coupon.code})
                    </p>
                    <p className="text-xs text-green-600">
                      -Rs. {appliedCoupon.discountAmount.toFixed(2)} discount
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
              
              {couponMessage && (
                <div className={`text-sm p-2 rounded-md ${
                  couponMessage.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {couponMessage.text}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <span>Discount ({appliedCoupon?.coupon.code})</span>
                <span className="font-medium">-Rs. {discountAmount.toFixed(2)}</span>
              </div>
            )}
            {deliveryFeeApplied > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Delivery fee</span>
                <span className="font-medium">Rs. {deliveryFeeApplied.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm border-t pt-3">
              <span className="text-gray-800 font-semibold">Total</span>
              <span className="font-bold">Rs. {grandTotal.toFixed(2)}</span>
            </div>
            {/* Checkout temporarily disabled */}
            <div className="rounded-md bg-yellow-50 text-yellow-800 text-sm p-3 mb-3">
              <p className="font-semibold mb-1">Checkout Temporarily Unavailable</p>
              <p className="text-xs">We&apos;re currently updating our checkout system. Please check back soon.</p>
            </div>
            <button
              className="w-full tsf-bg-blue text-white rounded-full py-4 text-lg font-semibold cursor-not-allowed opacity-50"
              disabled={true}
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
