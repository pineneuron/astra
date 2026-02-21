'use client'

import { useEffect, useState } from 'react'
import FAQAccordion from './FAQAccordion'

type FAQData = {
  heading: string
  items: Array<{
    id: string
    question: string
    answer: string
  }>
}

export default function DynamicFAQClient() {
  const [faqData, setFaqData] = useState<FAQData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFAQ() {
      try {
        const res = await fetch('/api/faq')
        if (res.ok) {
          const data = await res.json()
          if (data.items && data.items.length > 0) {
            setFaqData(data)
          }
        }
      } catch (error) {
        console.error('Error fetching FAQ:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFAQ()
  }, [])

  if (loading || !faqData) {
    return null
  }

  return <FAQAccordion heading={faqData.heading} items={faqData.items} />
}
