'use client';

import Image from 'next/image';
import { useState } from 'react';

const chevronDown = (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L8 8L15 1" stroke="#353E5C" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function BookingSection() {
  const [form, setForm] = useState({
    name: '', gender: '', dob: '', tob: '', phone: '', place: '', email: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up booking API
  }

  const inputClass = 'w-full h-[50px] bg-white border border-[#e6ccc2] rounded-[4px] px-4 tsf-font-public-sans text-[13px] text-black placeholder-[#9094a1] outline-none focus:border-[#f4aa36] transition-colors';
  const labelClass = 'tsf-font-public-sans text-[14px] text-black mb-1.5 block';

  return (
    <section className="relative w-full min-h-[600px] overflow-hidden flex items-center py-16">
      {/* Background */}
      <Image src="/images/bg-booking.jpg" alt="" fill className="object-cover object-center" />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-[1000px] mx-auto px-6 w-full">
        {/* Title */}
        <h2 className="tsf-font-larken-medium text-white text-[36px] leading-[45px] text-center tracking-[-1.8px] mb-10">
          Book Your Appointment Easily in Just a Few Steps.
        </h2>

        {/* Form card */}
        <div className="bg-[#ffeece] border border-black rounded-[10px] p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Row 1: Name | Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <div className="relative">
                  <select name="gender" value={form.gender} onChange={handleChange}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}>
                    <option value="">Select your Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">{chevronDown}</span>
                </div>
              </div>
            </div>

            {/* Row 2: Date of Birth | Time of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Date of Birth</label>
                <div className="relative">
                  <input name="dob" type="date" value={form.dob} onChange={handleChange}
                    placeholder="YY/MM/DD"
                    className={`${inputClass} appearance-none pr-10`} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Time of Birth</label>
                <div className="relative">
                  <input name="tob" type="time" value={form.tob} onChange={handleChange}
                    placeholder="hh/mm/am"
                    className={`${inputClass} appearance-none pr-10`} />
                </div>
              </div>
            </div>

            {/* Row 3: Phone | Place of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="987-xxxxxx" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Place of Birth (City, Country)</label>
                <input name="place" value={form.place} onChange={handleChange} placeholder="Select Location" className={inputClass} />
              </div>
            </div>

            {/* Row 4: Email (full width) */}
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="example@email.com"
                className={`${inputClass} border-[#b4b9c9]`} />
            </div>

            {/* Submit */}
            <div className="flex justify-center mt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-3 h-[44px] pl-6 pr-2 rounded-[27px] text-white tsf-font-larken-medium text-[16px] tracking-[-0.05em]"
                style={{ background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }}
              >
                Book Appointment
                <span className="flex items-center justify-center w-8 h-8 shrink-0">
                  <Image src="/images/icon-arrow-brown.svg" alt="" width={32} height={32} />
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
