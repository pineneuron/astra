import { NextResponse } from 'next/server'
import { PageService } from '@/lib/services'

const DEFAULT_FAQ_HEADING = 'frequently asked questions.'

type NormalizedFAQItem = {
  id: string
  question: string
  answer: string
}

function extractArray(source: Record<string, unknown>, key: string) {
  const value = source[key]
  return Array.isArray(value)
    ? (value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null))
    : []
}

export async function GET() {
  try {
    const page = await PageService.getPageBySlug('home')
    if (!page || !page.content || typeof page.content !== 'object') {
      return NextResponse.json({ heading: DEFAULT_FAQ_HEADING, items: [] })
    }

    const data = page.content as Record<string, unknown>
    const faqHeading = typeof data.faqHeading === 'string' ? data.faqHeading : DEFAULT_FAQ_HEADING
    const faqItems = extractArray(data, 'faqItems')
      .map((item, index) => {
        const question = item.question
        const answer = item.answer
        if (!question || !answer) return null
        return {
          id: `faq-${index}`,
          question: typeof question === 'string' ? question : '',
          answer: typeof answer === 'string' ? answer : '',
        } satisfies NormalizedFAQItem
      })
      .filter((item): item is NormalizedFAQItem => item !== null)

    return NextResponse.json({ heading: faqHeading, items: faqItems })
  } catch (error) {
    console.error('Error fetching FAQ data:', error)
    return NextResponse.json({ heading: DEFAULT_FAQ_HEADING, items: [] }, { status: 500 })
  }
}

