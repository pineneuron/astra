'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { ValidationUtils } from '@/lib/utils';

// Configurable order rules
const MIN_ORDER_AMOUNT = 2000; // Rs.
const DELIVERY_FEE = 150; // Rs. applied when subtotal < MIN_ORDER_AMOUNT

export default function CheckoutContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    items,
    subtotal,
    total,
    discountAmount,
    appliedCoupon,
    clear,
    isHydrated
  } = useCart();

  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Create account during checkout
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [accountPasswordConfirm, setAccountPasswordConfirm] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Checkout form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [city, setCity] = useState('Kathmandu');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [cashOnDelivery, setCashOnDelivery] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<{
    customer: { name: string; email: string; phone: string; alternativePhone?: string; city: string; address: string; landmark?: string };
    items: Array<{ name: string; qty: number; price: number; image?: string }>;
    summary: { subtotal: number; deliveryFee: number; total: number };
    paymentMethod: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    addressLine1?: string;
    paymentScreenshot?: string;
  }>({});

  // Check if items exist - wait for both mount and cart hydration
  // This ensures we don't show "empty cart" message before cart has loaded from localStorage
  // If not hydrated yet, optimistically assume items exist to prevent premature empty cart message
  // Only show empty cart if we're mounted AND hydrated AND items are actually empty
  const hasItems = mounted && isHydrated ? items.length > 0 : (mounted ? true : false);
  const showEmptyCart = mounted && isHydrated && items.length === 0 && !submitSuccess;

  // Only calculate these after hydration to prevent hydration mismatch
  const belowMinimum = mounted && isHydrated ? total < MIN_ORDER_AMOUNT : false;
  const deliveryFeeApplied = (mounted && isHydrated && hasItems && belowMinimum) ? DELIVERY_FEE : 0;
  const grandTotal = mounted && isHydrated ? total + deliveryFeeApplied : 0;
  const amountToReachMinimum = mounted && isHydrated ? Math.max(0, MIN_ORDER_AMOUNT - total) : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.email && !email) setEmail(session.user.email);
      if (session.user.name && !name) setName(session.user.name);
      setShowLogin(false);
    }
  }, [status, session, email, name]);

  async function handleCheckoutLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: loginEmail,
        password: loginPassword,
        callbackUrl: '/checkout',
      });

      if (result?.error) {
        setLoginError('Invalid email or password');
      } else {
        setShowLogin(false);
        setLoginEmail('');
        setLoginPassword('');
      }
    } catch {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  }

  function loginWith(provider: string) {
    signIn(provider, { callbackUrl: '/checkout' });
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
      },
      (err) => {
        setLocError(err.message || 'Unable to get your location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handlePaymentUpload(file: File) {
    const body = new FormData();
    body.append('file', file);
    body.append('folder', '3starfoods/payments');
    setUploadingPayment(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (res.ok && data?.url) {
        setPaymentScreenshotUrl(data.url);
      } else {
        setSubmitError(data?.error || 'Failed to upload payment screenshot');
      }
    } catch {
      setSubmitError('Failed to upload payment screenshot');
    } finally {
      setUploadingPayment(false);
    }
  }

  function validateField(fieldName: string, value: string): string | undefined {
    switch (fieldName) {
      case 'name':
        return !value.trim() ? 'Name is required' : undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
        return undefined;
      case 'phone':
        return !value.trim() ? 'Phone is required' : undefined;
      case 'city':
        return !value.trim() ? 'City is required' : undefined;
      case 'addressLine1':
        return !value.trim() ? 'Address Line 1 is required' : undefined;
      default:
        return undefined;
    }
  }

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    errors.name = validateField('name', name);
    errors.email = validateField('email', email);
    errors.phone = validateField('phone', phone);
    errors.city = validateField('city', city);
    errors.addressLine1 = validateField('addressLine1', addressLine1);

    // Payment screenshot is required if cash on delivery is not selected
    if (!cashOnDelivery && !paymentScreenshotUrl) {
      errors.paymentScreenshot = 'Payment screenshot is required unless you select Cash on Delivery';
    }

    setFieldErrors(errors);
    return !Object.values(errors).some(e => e !== undefined);
  }

  function handleFieldBlur(fieldName: string, value: string) {
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));

    // Check if email exists when user enters email
    if (fieldName === 'email' && value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      checkEmailExists(value);
    }
  }

  async function checkEmailExists(email: string) {
    setCheckingEmail(true);
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setEmailExists(data.exists || false);
    } catch {
      setEmailExists(false);
    } finally {
      setCheckingEmail(false);
    }
  }

  async function placeOrder() {
    setSubmitError(null);
    const isValid = validate();
    if (!isValid) {
      return;
    }

    // Create account if requested (only if not already logged in)
    if (createAccount && status !== 'authenticated') {
      // Validate password strength
      const passwordValidation = ValidationUtils.validatePassword(accountPassword || '');
      if (!passwordValidation.valid) {
        setSubmitError(passwordValidation.error || 'Invalid password');
        return;
      }
      if (accountPassword !== accountPasswordConfirm) {
        setSubmitError('Passwords do not match');
        return;
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password: accountPassword }),
        });

        if (!res.ok) {
          const data = await res.json();
          setSubmitError(data.error || 'Registration failed');
          return;
        }

        // Auto-login after registration
        const signInResult = await signIn('credentials', {
          redirect: false,
          email,
          password: accountPassword,
        });

        if (signInResult?.error) {
          // Continue with order even if auto-login fails
          console.warn('Account created but auto-login failed');
        }
      } catch {
        setSubmitError('Registration failed. Please try again.');
        return;
      }
    }

    try {
      setSubmitLoading(true);
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name,
            email,
            phone,
            alternativePhone: alternativePhone.trim() || undefined,
            city,
            address: [addressLine1.trim(), addressLine2.trim()].filter(Boolean).join(', '),
            landmark,
            notes,
            coords
          },
          items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, image: i.image })),
          summary: { subtotal, deliveryFee: deliveryFeeApplied, total: grandTotal, belowMinimum, discountAmount },
          paymentScreenshot: cashOnDelivery ? undefined : (paymentScreenshotUrl || undefined),
          cashOnDelivery,
          couponCode: appliedCoupon?.coupon.code || undefined
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to send order');

      // Store order details before clearing cart
      setOrderDetails({
        customer: {
          name,
          email,
          phone,
          alternativePhone: alternativePhone.trim() || undefined,
          city,
          address: [addressLine1.trim(), addressLine2.trim()].filter(Boolean).join(', '),
          landmark: landmark.trim() || undefined
        },
        items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price, image: i.image })),
        summary: {
          subtotal,
          deliveryFee: deliveryFeeApplied,
          total: grandTotal
        },
        paymentMethod: cashOnDelivery ? 'Cash on Delivery / Pay Later' : (paymentScreenshotUrl ? 'Prepaid (Payment Screenshot Provided)' : 'Prepaid')
      });

      setSubmitSuccess(true);
      clear();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Something went wrong';
      setSubmitError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  }

  // Scroll to top when order is successful
  useEffect(() => {
    if (submitSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [submitSuccess]);

  if (showEmptyCart) {
    return (
      <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl py-20">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl">🛒</div>
          <h2 className="text-3xl font-bold tsf-font-sora mb-4">Your cart is empty</h2>
          <p className="text-lg text-gray-600 mb-8">Add products to your cart to proceed with checkout.</p>
          <button
            onClick={() => router.push('/products')}
            className="tsf-bg-blue text-white rounded-full px-8 py-4 text-lg font-semibold cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl py-20">
      {/* Checkout temporarily disabled - Maintenance Message */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="rounded-lg bg-yellow-50 border-2 border-yellow-200 p-6 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-3xl">⚠️</div>
          <h2 className="text-2xl font-bold tsf-font-sora text-yellow-900 mb-2">Checkout Temporarily Unavailable</h2>
          <p className="text-lg text-yellow-800 mb-4">We&apos;re currently updating our checkout system to serve you better.</p>
          <p className="text-sm text-yellow-700 mb-6">Please check back soon. We apologize for any inconvenience.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="tsf-bg-blue text-white rounded-full px-8 py-3 text-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push('/products')}
              className="bg-white border-2 border-yellow-300 text-yellow-800 rounded-full px-8 py-3 text-lg font-semibold cursor-pointer hover:bg-yellow-50 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
      {submitSuccess && orderDetails ? (
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl">✓</div>
            <h2 className="text-4xl font-bold tsf-font-sora mb-2">Order placed successfully!</h2>
            <p className="text-lg text-gray-600">Thank you for your order. We will get back to you soon.</p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
            {/* Customer Details Section */}
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-900">{orderDetails.customer.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">
                    <a href={`mailto:${orderDetails.customer.email}`} className="text-[#030e55] underline">{orderDetails.customer.email}</a>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">
                    <a href={`tel:${orderDetails.customer.phone}`} className="text-[#030e55] underline">{orderDetails.customer.phone}</a>
                  </p>
                </div>
                {orderDetails.customer.alternativePhone && (
                  <div>
                    <p className="text-gray-600 mb-1">Alternative Phone</p>
                    <p className="font-medium text-gray-900">{orderDetails.customer.alternativePhone}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 mb-1">City</p>
                  <p className="font-medium text-gray-900">{orderDetails.customer.city}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Address</p>
                  <p className="font-medium text-gray-900">{orderDetails.customer.address}</p>
                </div>
                {orderDetails.customer.landmark && (
                  <div>
                    <p className="text-gray-600 mb-1">Landmark</p>
                    <p className="font-medium text-gray-900">{orderDetails.customer.landmark}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Section */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={60}
                                height={60}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-gray-700">{item.qty}</td>
                        <td className="py-4 px-4 text-right text-gray-700">Rs. {item.price.toFixed(2)}</td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900">Rs. {(item.price * item.qty).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="p-6 bg-gray-50">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">Rs. {orderDetails.summary.subtotal.toFixed(2)}</span>
                </div>
                {orderDetails.summary.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900">Rs. {orderDetails.summary.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-300">
                  <span className="text-gray-900">Order Total</span>
                  <span className="text-[#030e55]">Rs. {orderDetails.summary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Payment Method</h3>
              <p className="text-gray-700">{orderDetails.paymentMethod}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="tsf-bg-blue text-white rounded-full px-8 py-4 text-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push('/products')}
              className="bg-white border-2 border-gray-300 text-gray-700 rounded-full px-8 py-4 text-lg font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Login/Guest Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {status === 'authenticated' && session?.user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Logged in as</p>
                    <p className="font-semibold">{session.user.email}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/checkout' })}
                    className="text-sm text-[#030e55] cursor-pointer underline"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!showLogin ? (
                    <>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setShowLogin(true)}
                          className="px-4 py-2 tsf-bg-blue text-white rounded-full text-sm font-semibold cursor-pointer"
                        >
                          Log in
                        </button>
                        <span className="text-gray-500 text-sm">or</span>
                        <span className="text-sm text-gray-600">Continue as guest</span>
                      </div>
                      <div className="pt-2 border-t space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={createAccount}
                            onChange={(e) => setCreateAccount(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Create an account?</span>
                        </label>
                        {createAccount && (
                          <div className="pt-2 space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 border-t border-gray-300"></div>
                              <span className="text-gray-500 text-xs">or sign up with</span>
                              <div className="flex-1 border-t border-gray-300"></div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => loginWith("google")}
                                className="flex-1 flex items-center justify-center bg-white border border-gray-300 rounded-md py-2 font-semibold hover:bg-gray-50 text-sm"
                              >
                                <Image src="/images/google.svg" alt="Google" width={20} height={20} className="mr-2" /> Google
                              </button>
                              <button
                                type="button"
                                onClick={() => loginWith("facebook")}
                                className="flex-1 flex items-center justify-center bg-white border border-gray-300 rounded-md py-2 font-semibold hover:bg-gray-50 text-sm"
                              >
                                <Image src="/images/facebook.svg" alt="Facebook" width={20} height={20} className="mr-2" /> Facebook
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Login to your account</h3>
                      <form onSubmit={handleCheckoutLogin} className="space-y-3">
                        {loginError && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{loginError}</div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full border rounded-md p-3 text-sm"
                            required
                          />
                          <input
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full border rounded-md p-3 text-sm"
                            required
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={loginLoading}
                            className="px-4 py-2 tsf-bg-blue text-white rounded-full text-sm font-semibold disabled:opacity-50 cursor-pointer"
                          >
                            {loginLoading ? 'Logging in...' : 'Log in'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowLogin(false);
                              setLoginError('');
                              setLoginEmail('');
                              setLoginPassword('');
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="text-gray-500 text-xs">or</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loginWith("google")}
                          className="flex-1 flex items-center justify-center bg-white border border-gray-300 rounded-md py-2 font-semibold hover:bg-gray-50 text-sm"
                        >
                          <Image src="/images/google.svg" alt="Google" width={20} height={20} className="mr-2" /> Continue with Google
                        </button>
                        <button
                          onClick={() => loginWith("facebook")}
                          className="flex-1 flex items-center justify-center bg-white border border-gray-300 rounded-md py-2 font-semibold hover:bg-gray-50 text-sm"
                        >
                          <Image src="/images/facebook.svg" alt="Facebook" width={20} height={20} className="mr-2" /> Continue with Facebook
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        <button
                          onClick={() => router.push('/auth/login')}
                          className="text-[#030e55] hover:text-[#030e55]/80 underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold tsf-font-sora mb-6">Delivery Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Name <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    className={`w-full border rounded-md p-3 ${fieldErrors.name ? 'border-red-500' : ''}`}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        handleFieldBlur('name', e.target.value);
                      }
                    }}
                    onBlur={(e) => handleFieldBlur('name', e.target.value)}
                    required
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2">Email <span className="text-red-600">*</span></label>
                  <input
                    type="email"
                    className={`w-full border rounded-md p-3 ${fieldErrors.email ? 'border-red-500' : ''}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailExists(false);
                      if (fieldErrors.email) {
                        handleFieldBlur('email', e.target.value);
                      }
                    }}
                    onBlur={(e) => handleFieldBlur('email', e.target.value)}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                  )}
                  {emailExists && status !== 'authenticated' && !showLogin && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <p className="text-[#030e55] mb-1">An account with this email already exists.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail(email);
                          setShowLogin(true);
                          setCreateAccount(false);
                        }}
                        className="text-[#030e55] hover:text-[#030e55]/80 underline font-medium"
                      >
                        Click here to log in
                      </button>
                    </div>
                  )}
                  {checkingEmail && (
                    <p className="text-xs text-gray-500 mt-1">Checking email...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2">Phone <span className="text-red-600">*</span></label>
                  <input
                    type="tel"
                    className={`w-full border rounded-md p-3 ${fieldErrors.phone ? 'border-red-500' : ''}`}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) {
                        handleFieldBlur('phone', e.target.value);
                      }
                    }}
                    onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                    required
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2">Alternative Phone</label>
                  <input
                    type="tel"
                    className="w-full border rounded-md p-3"
                    value={alternativePhone}
                    onChange={(e) => setAlternativePhone(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">City <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <select
                      className={`w-full border rounded-md p-3 pr-10 appearance-none ${fieldErrors.city ? 'border-red-500' : ''}`}
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (fieldErrors.city) {
                          handleFieldBlur('city', e.target.value);
                        }
                      }}
                      onBlur={(e) => handleFieldBlur('city', e.target.value)}
                    >
                      <option value="Kathmandu">Kathmandu</option>
                      <option value="Bhaktapur">Bhaktapur</option>
                      <option value="Lalitpur">Lalitpur</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5 text-gray-500">
                        <path fillRule="evenodd" d="M10 12a1 1 0 0 1-.7-.29l-4-4a1 1 0 1 1 1.4-1.42L10 9.59l3.3-3.3a1 1 0 0 1 1.4 1.42l-4 4A1 1 0 0 1 10 12Z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  {fieldErrors.city && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2">Address Line 1 <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      className={`w-full border rounded-md p-3 pr-12 ${fieldErrors.addressLine1 ? 'border-red-500' : ''}`}
                      value={addressLine1}
                      onChange={(e) => {
                        setAddressLine1(e.target.value);
                        if (fieldErrors.addressLine1) {
                          handleFieldBlur('addressLine1', e.target.value);
                        }
                      }}
                      onBlur={(e) => handleFieldBlur('addressLine1', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      aria-label="Use my location"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md border flex items-center justify-center hover:bg-gray-50"
                      onClick={useMyLocation}
                    >
                      <span className="text-lg">📍</span>
                    </button>
                  </div>
                  {fieldErrors.addressLine1 && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.addressLine1}</p>
                  )}
                  {coords && (
                    <div className="text-xs text-gray-600 mt-1">
                      Location: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}{' '}
                      <a
                        className="underline"
                        href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View map
                      </a>
                    </div>
                  )}
                  {locError && <div className="text-xs text-red-600 mt-1">{locError}</div>}
                </div>

                <div>
                  <label className="block text-sm mb-2">Address Line 2</label>
                  <input
                    type="text"
                    className="w-full border rounded-md p-3"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Nearest Landmark</label>
                  <input
                    type="text"
                    className="w-full border rounded-md p-3"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Notes</label>
                  <textarea
                    className="w-full border rounded-md p-3"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* Create Account Password Fields */}
                {createAccount && status !== 'authenticated' && (
                  <>
                    <div>
                      <label className="block text-sm mb-2">Create Account Password <span className="text-red-600">*</span></label>
                      <input
                        type="password"
                        className="w-full border rounded-md p-3"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Confirm Password <span className="text-red-600">*</span></label>
                      <input
                        type="password"
                        className="w-full border rounded-md p-3"
                        value={accountPasswordConfirm}
                        onChange={(e) => setAccountPasswordConfirm(e.target.value)}
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold tsf-font-sora mb-6">Payment Information</h2>
              <div className="border rounded-md p-4">
                <h5 className="text-lg font-semibold tsf-font-sora mb-4">Pay to Bank (QR)</h5>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-100 h-auto rounded-md overflow-hidden flex items-center justify-center">
                    <Image src="/images/static-payment-qr.jpg" alt="payment-qr" width={400} height={400} className="object-contain w-full h-full bg-gray-50" />
                  </div>
                  {/* <div className="text-sm">
                      <div className="mb-2"><span className="font-semibold">Account Name:</span> THREE STAR FOODS PRIVATE LIMITED</div>
                      <div className="mb-2"><span className="font-semibold">Account No:</span> 2222030001225478</div>
                      <div className="mb-2"><span className="font-semibold">Bank:</span> XYZ Bank, Nepal</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {cashOnDelivery 
                          ? 'Or select "Cash on Delivery" below to pay when order arrives.'
                          : 'After payment, please upload screenshot below or select "Cash on Delivery" option.'}
                      </div>
                    </div> */}
                </div>
                {!cashOnDelivery && (
                  <div className="mt-4">
                    <label className="block text-sm text-gray-600 mb-2">
                      Upload payment screenshot <span className="text-red-500">*</span>
                    </label>
                    {!paymentScreenshotUrl && (
                      <div className="rounded-md border border-gray-300 bg-white p-3">
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-6 text-sm hover:bg-gray-50">
                          <span>Click to upload payment screenshot</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void handlePaymentUpload(f);
                            }}
                          />
                        </label>
                        {uploadingPayment && <div className="mt-2 text-xs text-gray-500">Uploading...</div>}
                      </div>
                    )}
                    {paymentScreenshotUrl && (
                      <div className="relative inline-block mt-3">
                        <button
                          type="button"
                          aria-label="Remove payment screenshot"
                          onClick={() => setPaymentScreenshotUrl(null)}
                          className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow hover:bg-white"
                        >
                          ×
                        </button>
                        <div className="w-40 aspect-square overflow-hidden rounded-md border border-gray-200">
                          <Image
                            src={paymentScreenshotUrl}
                            alt="payment-proof"
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {fieldErrors.paymentScreenshot && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.paymentScreenshot}</p>
                    )}
                  </div>
                )}

                {/* Cash on Delivery checkbox */}
                <div className="mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cashOnDelivery}
                      onChange={(e) => {
                        setCashOnDelivery(e.target.checked);
                        // Clear payment screenshot error when checkbox is checked
                        if (e.target.checked) {
                          setFieldErrors(prev => ({ ...prev, paymentScreenshot: undefined }));
                        }
                      }}
                      className="rounded w-4 h-4 text-[#030e55] hover:text-[#030e55]/80 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      Cash on Delivery / Pay Later
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500 ml-6">
                    Select this option if you want to pay when the order is delivered
                  </p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-md bg-red-50 text-red-700 text-sm p-4">{submitError}</div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-2xl font-bold tsf-font-sora mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {mounted && isHydrated && items.map((item) => (
                  <div key={`${item.id}-${item.variation || 'default'}`} className="flex gap-3 pb-4 border-b">
                    <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-semibold">{item.name}</h4>
                      {item.variation && (
                        <p className="text-xs text-[#030e55] mt-1">Variation: {item.variation}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">Qty: {item.qty} × Rs. {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {!mounted || !isHydrated ? (
                  <div className="text-center py-4 text-gray-500 text-sm">Loading items...</div>
                ) : null}
              </div>

              {mounted && isHydrated && belowMinimum && (
                <div className="rounded-md bg-yellow-50 text-yellow-800 text-sm p-3 mb-4">
                  Add <span className="font-semibold">Rs. {amountToReachMinimum.toFixed(2)}</span> more to reach the minimum order amount (Rs. {MIN_ORDER_AMOUNT}). You can still checkout now; a delivery fee applies.
                </div>
              )}

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {mounted && isHydrated ? `Rs. ${subtotal.toFixed(2)}` : 'Rs. 0.00'}
                  </span>
                </div>
                {mounted && isHydrated && discountAmount > 0 && (
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
                <div className="flex items-center justify-between text-lg border-t pt-3">
                  <span className="text-gray-800 font-semibold">Total</span>
                  <span className="font-bold">
                    {mounted && isHydrated ? `Rs. ${grandTotal.toFixed(2)}` : 'Rs. 0.00'}
                  </span>
                </div>
              </div>

              <button
                className="w-full tsf-bg-blue text-white rounded-full py-4 text-lg font-semibold mt-6 cursor-pointer"
                onClick={placeOrder}
                disabled={submitLoading}
              >
                {submitLoading ? 'Placing Order...' : 'Place Order'}
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full border rounded-full py-4 text-lg mt-3"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
