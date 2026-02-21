import { prisma } from '@/lib/db'
import PagesClient from './PagesClient'
import { createPage, updatePage, deletePage, updatePageStatus } from './actions'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ q?: string }>

type SerializablePage = {
  id: string
  title: string
  slug: string
  template: string
  status: 'DRAFT' | 'PUBLISHED'
  content: Record<string, unknown>
  seo: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export default async function AdminPages({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const q = (sp?.q || '').trim()

  const pages = await prisma.page.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { template: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: [{ updatedAt: 'desc' }],
  })

  const serializablePages: SerializablePage[] = pages.map((page) => {
    const safeContent = (() => {
      try {
        // If content is already an object, use it directly
        if (page.content && typeof page.content === 'object' && !Array.isArray(page.content)) {
          return page.content as Record<string, unknown>
        }
        // If it's a string, try to parse it
        if (typeof page.content === 'string') {
          return JSON.parse(page.content) as Record<string, unknown>
        }
        return {}
      } catch {
        return {}
      }
    })()

    const safeSeo = (() => {
      try {
        // If SEO is already an object, use it directly
        if (page.seo && typeof page.seo === 'object' && !Array.isArray(page.seo)) {
          return page.seo as Record<string, unknown>
        }
        // If it's a string, try to parse it
        if (typeof page.seo === 'string') {
          return JSON.parse(page.seo) as Record<string, unknown>
        }
        return {}
      } catch {
        return {}
      }
    })()

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      template: page.template,
      status: page.status as 'DRAFT' | 'PUBLISHED',
      content: safeContent,
      seo: safeSeo,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
      publishedAt: page.publishedAt ? page.publishedAt.toISOString() : null,
    }
  })

  return (
    <PagesClient
      q={q}
      pages={serializablePages}
      actions={{
        createPage,
        updatePage,
        deletePage,
        updatePageStatus,
      }}
    />
  )
}
