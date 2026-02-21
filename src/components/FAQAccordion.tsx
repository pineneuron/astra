'use client';

import { useEffect, useMemo, useState } from 'react';

export type FAQItem = {
  id?: string;
  question?: string;
  answer?: string;
}

export interface FAQAccordionProps {
  heading?: string;
  items?: FAQItem[];
}

const defaultFaqItems: Required<FAQItem>[] = [
  {
    id: 'faq1',
    question: 'Freshly cut, freshly packed meat delivered to your doorstep?',
    answer: 'In which countries is it possible to shop online?',
  },
  {
    id: 'faq2',
    question: 'What are your delivery areas and timings?',
    answer:
      'We deliver to major cities across Nepal. Our delivery timings are from 9 AM to 8 PM, Monday to Saturday.',
  },
  {
    id: 'faq3',
    question: 'How do you ensure the quality and freshness of your products?',
    answer:
      'We follow strict quality control measures and maintain cold chain storage to ensure all our products are fresh and safe for consumption.',
  },
  {
    id: 'faq4',
    question: 'What payment methods do you accept?',
    answer:
      'We accept cash on delivery, eSewa, Khalti, and major credit/debit cards for your convenience.',
  },
]

const FAQAccordion: React.FC<FAQAccordionProps> = ({ heading, items }) => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const faqItems = useMemo(() => {
    const source = items && items.length > 0 ? items : defaultFaqItems;
    return source
      .map((item, index) => {
        const fallback = defaultFaqItems[index % defaultFaqItems.length];
        const question = item.question || fallback.question;
        const answer = item.answer || fallback.answer;
        if (!question || !answer) return null;
        return {
          id: item.id || fallback.id || `faq-${index}`,
          question,
          answer,
        };
      })
      .filter((item): item is Required<FAQItem> => item !== null);
  }, [items]);

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const headingText = heading || 'frequently asked questions.';

  return (
    <div className="tsf-faq relative py-20" suppressHydrationWarning>
      <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl">
        <div className="tsf-category_heading pb-10">
          <h2 className="tsf-dark-color text-4xl font-bold text-center tsf-font-sora capitalize">
            {headingText}
          </h2>
        </div>
        <div className="accordions">
          {faqItems.map((item) => (
            <div key={item.id} className="accordion_item py-2">
              <div
                className={
                  'title_tab tsf-box-shadow rounded-full py-5 px-8 cursor-pointer transition-colors duration-300 ' +
                  (isMounted && openItems.includes(item.id) ? 'active' : '')
                }
                onClick={() => toggleItem(item.id!)}
              >
                <h3 className="title text-black tsf-font-sora flex justify-between items-center">
                  {item.question}
                  <span
                    className={`icon transition-transform duration-300 ${
                      openItems.includes(item.id) ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </h3>
              </div>
              <div
                className={
                  'inner_content transition-all duration-300 overflow-hidden ' +
                  (isMounted && openItems.includes(item.id)
                    ? 'max-h-96 opacity-100 mt-4'
                    : 'max-h-0 opacity-0')
                }
              >
                <p className="p-4 text-gray-700">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQAccordion;
