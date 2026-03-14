'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

type Service = {
  title: string;
  price: number;
  priceUnit: string;
  image: string;
  href: string;
  slug: string;
  buttonText: string;
};

const chevronDown = (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L8 8L15 1" stroke="#353E5C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Payment QR image
const PAYMENT_QR_URL = '/images/payment-qr.jpg';

export default function ServiceBookingForm({ service }: { service: Service }) {
  const { formatPrice } = useCurrency();
  const [form, setForm] = useState({
    name: '',
    gender: '',
    dob: '',
    tob: '',
    phone: '',
    place: '',
    email: '',
  });
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<{
    bookingNumber: string;
    submittedAt: string;
  } | null>(null);
  const [qrImageError, setQrImageError] = useState(false);

  useEffect(() => {
    if (submitSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [submitSuccess]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handlePaymentScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPayment(true);
    setSubmitError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'astra-bookings');
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (data?.url) {
        setPaymentScreenshotUrl(data.url);
      } else {
        setSubmitError(data?.error || 'Failed to upload screenshot');
      }
    } catch {
      setSubmitError('Failed to upload screenshot');
    } finally {
      setUploadingPayment(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!paymentScreenshotUrl) {
      setSubmitError('Please upload your payment screenshot');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceSlug: service.slug,
          serviceTitle: service.title,
          amount: service.price,
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          gender: form.gender,
          dateOfBirth: form.dob,
          timeOfBirth: form.tob,
          placeOfBirth: form.place,
          paymentScreenshot: paymentScreenshotUrl,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data?.error || 'Failed to submit booking');
        return;
      }
      setBookingConfirmation({
        bookingNumber: data.bookingNumber ?? '',
        submittedAt: new Date().toISOString(),
      });
      setSubmitSuccess(true);
    } catch {
      setSubmitError('Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full h-[50px] bg-white border border-[#e6ccc2] rounded-[4px] px-4 tsf-font-public-sans text-[13px] text-black placeholder-[#9094a1] outline-none focus:border-[#f4aa36] transition-colors';
  const labelClass = 'tsf-font-public-sans text-[14px] text-black mb-1.5 block';

  if (submitSuccess && bookingConfirmation) {
    const submittedDate = new Date(bookingConfirmation.submittedAt);
    const formattedDate = submittedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div className="max-w-[640px] mx-auto px-6 mt-12 mb-16">
        {/* Success header */}
        <div className="bg-[#ffeece] border border-black rounded-t-[10px] p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-600">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="tsf-font-larken-medium text-black text-[28px] mb-2">Booking Submitted!</h2>
          <p className="tsf-font-public-sans text-[16px] text-[#575d73]">
            Thank you for your booking. We will review your payment screenshot and confirm your appointment shortly.
          </p>
          <p className="tsf-font-public-sans font-semibold text-black text-[18px] mt-4">
            Booking #{bookingConfirmation.bookingNumber}
          </p>
        </div>

        {/* Order details */}
        <div className="bg-white border border-t-0 border-black rounded-b-[10px] overflow-hidden">
          <div className="border-b border-[#e6ccc2] px-6 py-4">
            <h3 className="tsf-font-larken-medium text-black text-[18px] mb-3">Booking details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 tsf-font-public-sans text-[14px]">
              <div className="flex justify-between sm:block">
                <span className="text-[#575d73]">Service</span>
                <span className="font-medium text-black sm:block">{service.title}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-[#575d73]">Amount</span>
                <span className="font-medium text-black sm:block">{formatPrice(service.price, service.priceUnit)}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-[#575d73]">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-amber-100 text-amber-800">Pending</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-[#575d73]">Submitted</span>
                <span className="font-medium text-black sm:block">{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="border-b border-[#e6ccc2] px-6 py-4">
            <h3 className="tsf-font-larken-medium text-black text-[18px] mb-3">Customer details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 tsf-font-public-sans text-[14px]">
              <div className="flex justify-between sm:block">
                <span className="text-[#575d73]">Full name</span>
                <span className="font-medium text-black sm:block">{form.name}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-[#575d73]">Email</span>
                <span className="font-medium text-black sm:block">{form.email}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-[#575d73]">Phone</span>
                <span className="font-medium text-black sm:block">{form.phone}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-[#575d73]">Gender</span>
                <span className="font-medium text-black sm:block capitalize">{form.gender}</span>
              </div>
              <div className="flex justify-between sm:block sm:col-span-2">
                <span className="text-[#575d73]">Date of birth</span>
                <span className="font-medium text-black sm:block">{form.dob}</span>
              </div>
              <div className="flex justify-between sm:block sm:col-span-2">
                <span className="text-[#575d73]">Time of birth</span>
                <span className="font-medium text-black sm:block">{form.tob}</span>
              </div>
              <div className="flex justify-between sm:block sm:col-span-2">
                <span className="text-[#575d73]">Place of birth</span>
                <span className="font-medium text-black sm:block">{form.place}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 h-[44px] px-6 rounded-[27px] text-white tsf-font-public-sans text-[16px] tracking-[-0.05em] cursor-pointer"
              style={{ background: 'linear-gradient(to right, rgba(243,115,53,0.9), rgba(244,170,54,0.9))' }}
            >
              <span className="flex -scale-x-100 shrink-0">
                <Image src="/images/hero-arrow-btn.svg" alt="" width={24} height={24} />
              </span>
              Back to Home
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-[27px] border-2 border-[#b4b9c9] text-black tsf-font-public-sans text-[16px] font-medium hover:bg-gray-50 transition-colors"
            >
              Browse Services
              <Image src="/images/icon-arrow-dark.svg" alt="" width={24} height={24} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-6">
      {/* Service card + Price */}
      <div className="bg-white border border-[#b4b9c9] rounded-[10px] p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-full sm:w-[120px] h-[100px] shrink-0 overflow-hidden rounded-[4px]">
          <Image src={service.image} alt={service.title} fill className="object-cover" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="tsf-font-larken-medium text-black text-[24px]">{service.title}</h1>
          <p className="tsf-font-public-sans text-black text-[20px] font-semibold mt-1">{formatPrice(service.price, service.priceUnit)}</p>
        </div>
        <Link href="/" className="tsf-font-public-sans text-[14px] text-[#0d6800] hover:underline">
          ← Back to services
        </Link>
      </div>

      {/* Form + Payment */}
      <div className="bg-[#ffeece] border border-black rounded-[10px] p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Row 1: Full Name | Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Full Name"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email Address"
                className={`${inputClass} border-[#b4b9c9]`}
                required
              />
            </div>
          </div>

          {/* Row 2: Phone Number | Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="987-xxxxxx"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <div className="relative">
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                  required
                >
                  <option value="">Select your Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">{chevronDown}</span>
              </div>
            </div>
          </div>

          {/* Row 3: Date of Birth | Time of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                className={`${inputClass} appearance-none pr-10`}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Time of Birth</label>
              <input
                name="tob"
                type="time"
                value={form.tob}
                onChange={handleChange}
                className={`${inputClass} appearance-none pr-10`}
                required
              />
            </div>
          </div>

          {/* Row 4: Place of Birth */}
          <div>
            <label className={labelClass}>Place of Birth (City, Country)</label>
            <input
              name="place"
              value={form.place}
              onChange={handleChange}
              placeholder="Your City & Country"
              className={inputClass}
              required
            />
          </div>

          {/* QR Code */}
          <div className="p-6 bg-white rounded-[8px] border border-[#e6ccc2]">
            <h3 className="tsf-font-larken-medium text-black text-[18px] mb-2">Scan to Pay</h3>
            <p className="tsf-font-public-sans text-[#575d73] text-[14px] mb-4">
              Scan the QR code below to complete your payment, then upload the screenshot.
            </p>
            <div className="w-[280px] h-[280px] relative bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {!qrImageError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={PAYMENT_QR_URL}
                  alt="Payment QR Code"
                  width={280}
                  height={280}
                  className="object-contain w-full h-full"
                  onError={() => setQrImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4 text-center tsf-font-public-sans text-[13px] text-[#575d73]">
                  Add your payment QR at <br />
                  <code className="text-xs">public/images/payment-qr.jpg</code>
                </div>
              )}
            </div>
          </div>

          {/* Payment Screenshot Upload */}
          <div>
            <label className={labelClass}>Payment Screenshot *</label>
            <p className="tsf-font-public-sans text-[#575d73] text-[13px] mb-2">
              After paying, upload a screenshot of your payment confirmation.
            </p>
            {!paymentScreenshotUrl ? (
              <div className="rounded-md border border-dashed border-[#b4b9c9] bg-white p-4">
                <label className="flex flex-col items-center justify-center cursor-pointer min-h-[120px]">
                  <span className="tsf-font-public-sans text-[14px] text-[#575d73]">
                    {uploadingPayment ? 'Uploading...' : 'Click to upload payment screenshot'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePaymentScreenshotUpload}
                    disabled={uploadingPayment}
                  />
                </label>
              </div>
            ) : (
              <div className="relative inline-block">
                <div className="rounded border border-[#e6ccc2] overflow-hidden bg-gray-50 p-1">
                  {/* Use img to preserve natural aspect ratio (mobile screenshots are typically 9:16 portrait) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={paymentScreenshotUrl}
                    alt="Payment proof"
                    className="block max-w-[280px] max-h-[420px] w-auto h-auto object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentScreenshotUrl(null)}
                  aria-label="Remove screenshot"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>

          {submitError && (
            <p className="tsf-font-public-sans text-red-600 text-[14px]">{submitError}</p>
          )}

          {/* Submit */}
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-3 h-[44px] pl-6 pr-2 rounded-[27px] text-white tsf-font-public-sans text-[16px] tracking-[-0.05em] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, rgba(243,115,53,0.9), rgba(244,170,54,0.9))' }}
            >
              {submitting ? 'Submitting...' : 'Submit Booking'}
              <span className="flex items-center justify-center w-8 h-8 shrink-0">
                <Image src="/images/hero-arrow-btn.svg" alt="" width={32} height={32} />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
