'use client';

import Image from 'next/image';
import { useState } from 'react';

const categories = [
  'Rudraksha',
  'Crystals',
  'Tantra',
  'Zodiac',
  'Wealth',
  'Business',
];

const faqData: Record<string, { q: string; a: string }[]> = {
  Rudraksha: [
    {
      q: 'What is Rudraksha?',
      a: 'Rudraksha is a sacred seed traditionally used for spiritual growth, meditation, and protection. It is associated with Lord Shiva and is believed to carry powerful natural energy.',
    },
    {
      q: 'How should Rudraksha be worn?',
      a: 'Rudraksha should ideally be worn after proper energization (prana pratishtha). It can be worn around the neck or wrist. It is recommended to wear it with a pure heart and after consulting an expert for the right Mukhi.',
    },
    {
      q: 'How many types (Mukhi) of Rudraksha are there?',
      a: 'Rudraksha beads range from 1 Mukhi to 21 Mukhi, each with unique spiritual and healing properties. The most commonly used are 1 to 14 Mukhi beads.',
    },
  ],
  Crystals: [
    {
      q: 'What are healing crystals?',
      a: 'Healing crystals are natural gemstones believed to carry specific vibrational energies that can support physical, emotional, and spiritual well-being.',
    },
    {
      q: 'How do I choose the right crystal?',
      a: 'The right crystal is often chosen based on your intention, zodiac sign, or specific area of life you want to improve. Consulting an expert is recommended.',
    },
    {
      q: 'How should I cleanse my crystals?',
      a: 'Crystals can be cleansed using moonlight, sunlight, salt water, sound vibrations, or by burying them in the earth. Regular cleansing keeps their energy clear.',
    },
  ],
  Tantra: [
    {
      q: 'What is Tantra?',
      a: 'Tantra is an ancient spiritual tradition that uses rituals, mantras, and meditation to awaken consciousness and harness cosmic energy for transformation.',
    },
    {
      q: 'Is Tantra only about rituals?',
      a: 'No. Tantra encompasses a broad range of practices including yoga, meditation, mantra chanting, and devotion — all aimed at spiritual liberation.',
    },
    {
      q: 'What is a Yantra?',
      a: 'A Yantra is a sacred geometric diagram used as a meditative tool and energy conduit in Tantric practices, representing specific deities or cosmic forces.',
    },
  ],
  Zodiac: [
    {
      q: 'What is a zodiac sign?',
      a: 'A zodiac sign is determined by the position of the sun at the time of your birth. There are 12 zodiac signs, each associated with distinct personality traits and life themes.',
    },
    {
      q: 'How does astrology affect daily life?',
      a: 'Astrology provides insights into personality, relationships, and life cycles. Many people use it as a self-awareness tool and for timing major decisions.',
    },
    {
      q: 'What is a birth chart?',
      a: 'A birth chart (kundali) is a map of the sky at the exact moment of your birth. It reveals planetary positions that influence your personality, strengths, and life path.',
    },
  ],
  Wealth: [
    {
      q: 'Which Rudraksha is best for wealth?',
      a: 'The 8 Mukhi and Gauri Shankar Rudraksha are considered powerful for attracting prosperity, removing obstacles, and enhancing financial stability.',
    },
    {
      q: 'Which crystals attract abundance?',
      a: 'Citrine, Pyrite, and Green Aventurine are widely used for attracting wealth, success, and positive financial energy.',
    },
    {
      q: 'What Vedic remedies help with financial growth?',
      a: 'Chanting Lakshmi mantras, wearing auspicious gemstones, and performing specific pujas on auspicious days are common Vedic remedies for financial growth.',
    },
  ],
  Business: [
    {
      q: 'What spiritual tools help in business?',
      a: 'Yantras like the Vyapar Vridhi Yantra, gemstones like Yellow Sapphire, and Rudraksha beads are commonly used to support business growth and stability.',
    },
    {
      q: 'Can astrology predict business success?',
      a: 'Astrology can indicate favourable periods for business ventures, partnership compatibility, and potential challenges, helping entrepreneurs make informed decisions.',
    },
    {
      q: 'What is the best gemstone for entrepreneurs?',
      a: 'Yellow Sapphire (Pukhraj) is considered one of the most powerful gems for business owners, associated with wisdom, prosperity, and good fortune.',
    },
  ],
};

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState('Rudraksha');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = faqData[activeCategory] ?? [];

  return (
    <section className="relative w-full overflow-hidden py-10 sm:py-14 lg:py-16">
      {/* Background */}
      <Image
        src="/images/bg-faq.jpg"
        alt=""
        fill
        className="object-cover object-center"
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Heading */}
        <h2 className="tsf-font-larken text-black text-[26px] sm:text-[30px] lg:text-[36px] text-center mb-6 sm:mb-8 lg:mb-10">
          Frequently Asked Questions
        </h2>

        {/* Card: column on mobile (tabs row + accordion), row on desktop */}
        <div className="bg-[#ffeece] rounded-[16px] lg:rounded-[20px] p-4 sm:p-6 flex flex-col lg:flex-row gap-4 lg:gap-5">
          {/* Category tabs: horizontal scroll on mobile, vertical sidebar on desktop */}
          <div className="flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 lg:w-[260px] lg:shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenIndex(0); }}
                className={`shrink-0 lg:w-full h-[48px] lg:h-[60px] px-4 lg:px-0 rounded-[10px] tsf-font-public-sans text-[15px] lg:text-[18px] transition-all ${
                  activeCategory === cat
                    ? 'text-white'
                    : 'bg-white text-black hover:bg-orange-50'
                }`}
                style={
                  activeCategory === cat
                    ? { background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }
                    : {}
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="flex-1 min-w-0 bg-white rounded-[16px] lg:rounded-[20px] px-4 sm:px-6 lg:px-8 py-4 lg:py-6 flex flex-col gap-0">
            {faqs.map((item, i) => (
              <div key={i} className="border-b border-[#e8e8e8] last:border-0">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between py-4 sm:py-5 text-left gap-3"
                >
                  <span className="tsf-font-public-sans text-[16px] sm:text-[18px] lg:text-[20px] text-black font-normal text-left">
                    {item.q}
                  </span>
                  <Image
                    src={
                      openIndex === i
                        ? '/images/icon-chevron-up.svg'
                        : '/images/icon-chevron-down-dark.svg'
                    }
                    alt=""
                    width={24}
                    height={24}
                    className="shrink-0"
                  />
                </button>
                {openIndex === i && (
                  <p className="tsf-font-larken text-[#222] text-[15px] sm:text-[16px] lg:text-[18px] leading-[24px] lg:leading-[28px] pb-4 lg:pb-5">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
