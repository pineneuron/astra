'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const events = [
  {
    title: 'Skill-based and capacity-building trainings',
    when: 'Ongoing Events',
    href: '/events/skill-based-trainings',
  },
  {
    title: 'Professional and technical trainings',
    when: '10:30 am - 4:00 pm\nSunday 23rd March 2026',
    href: '/events/professional-trainings',
  },
  {
    title: 'Health, education, and community focused trainings',
    when: 'Ongoing Events',
    href: '/events/community-trainings',
  },
];

export default function EventsSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="relative w-full bg-white overflow-hidden py-14">
      {/* Faint decorative blobs */}
      <div className="pointer-events-none absolute top-0 right-1/4 w-[320px] h-[320px] rounded-full bg-[rgba(243,115,53,0.06)] -translate-y-1/2" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full bg-[rgba(244,170,54,0.05)] translate-x-1/3 translate-y-1/3" />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header row */}
        <div className="flex items-center justify-between flex-col lg:flex-row mb-10">
          <h2 className="tsf-font-larken text-black text-[36px]">
            Our Latest Events
          </h2>
          <Link
            href="/events"
            className="flex items-center gap-2 tsf-font-public-sans font-medium text-[16px] text-black hover:opacity-70 transition-opacity"
          >
            View All Events
            <Image src="/images/icon-arrow-right-sm.svg" alt="" width={16} height={10} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event, i) => {
            const active = hovered === i;
            return (
              <div
                key={event.href}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="rounded-[10px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col p-6 gap-4 transition-all duration-300 cursor-default"
                style={
                  active
                    ? { background: 'linear-gradient(to top, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }
                    : { background: '#ffffff' }
                }
              >
                {/* Badges */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-[#460b04] rounded-[3px] px-2.5 h-[32px]">
                    <Image src="/images/icon-video.svg" alt="" width={14} height={12} />
                    <span className="tsf-font-public-sans font-medium text-[10px] text-[#d97706] uppercase tracking-wide">
                      Online
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-center rounded-[3px] px-3 h-[32px] transition-colors duration-300"
                    style={
                      active
                        ? { background: '#460b04' }
                        : { background: 'linear-gradient(to bottom, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }
                    }
                  >
                    <span className="tsf-font-public-sans font-medium text-[10px] text-white uppercase tracking-wide">
                      Book Now
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className={`tsf-font-larken-medium text-[19px] leading-[30px] underline flex-1 transition-colors duration-300 ${active ? 'text-white' : 'text-black'}`}>
                  {event.title}
                </h3>

                {/* When */}
                <div>
                  <p className={`tsf-font-larken-medium text-[12px] uppercase mb-1 transition-colors duration-300 ${active ? 'text-white/80' : 'text-[#d97706]'}`}>
                    When
                  </p>
                  <p className={`tsf-font-public-sans text-[16px] leading-[26px] font-light whitespace-pre-line transition-colors duration-300 ${active ? 'text-white' : 'text-black'}`}>
                    {event.when}
                  </p>
                </div>

                {/* Divider + View Details */}
                <div className="border-t border-[#d9d9d9] pt-4 flex items-center justify-between">
                  <Link
                    href="#"
                    className={`tsf-font-public-sans font-medium text-[16px] underline hover:opacity-70 transition-colors duration-300 cursor-pointer ${active ? 'text-white' : 'text-black'}`}
                  >
                    View Event Details
                  </Link>
                  <Link href="#" aria-label="View event details" className="shrink-0 cursor-pointer">
                    <Image
                      src={active ? '/images/icon-arrow-circle-light.svg' : '/images/icon-arrow-circle-dark.svg'}
                      alt=""
                      width={35}
                      height={35}
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
