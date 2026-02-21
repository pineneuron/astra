'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PageStatus, Prisma } from '@prisma/client'
import { PAGE_TEMPLATES, getTemplateDefaultContent } from '@/config/pageTemplates'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }
  return session
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function ensureUniqueSlug(baseSlug: string, existingId?: string) {
  let slug = baseSlug
  let counter = 2
  // loop until unique (ignoring the current page if editing)
  while (true) {
    const found = await prisma.page.findUnique({ where: { slug } })
    if (!found || found.id === existingId) {
      break
    }
    slug = `${baseSlug}-${counter++}`
  }
  return slug
}

export async function createPage(formData: FormData) {
  await requireAdmin()
  const title = String(formData.get('title') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim() || slugify(title)
  const template = String(formData.get('template') || '').trim()

  if (!title || !template || !(template in PAGE_TEMPLATES)) {
    return
  }

  const slug = await ensureUniqueSlug(rawSlug || slugify(title))
  const defaultContent = getTemplateDefaultContent(template as keyof typeof PAGE_TEMPLATES)

  await prisma.page.create({
    data: {
      title,
      slug,
      template,
      status: PageStatus.DRAFT,
      content: defaultContent as unknown as Prisma.InputJsonValue,
      seo: {} as unknown as Prisma.InputJsonValue,
    },
  })

  revalidatePath('/admin/pages')
  revalidatePath(`/${slug}`)
}

export async function updatePage(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '').trim()
  if (!id) return

  const title = String(formData.get('title') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim()
  const template = String(formData.get('template') || '').trim()
  const statusValue = String(formData.get('status') || PageStatus.DRAFT)
  const contentPayload = String(formData.get('content') || '{}')
  const seoPayload = String(formData.get('seo') || '{}')
  const previousSlug = String(formData.get('previousSlug') || '').trim()

  if (!template || !(template in PAGE_TEMPLATES)) return

  const existing = await prisma.page.findUnique({ where: { id } })
  if (!existing) return

  const parsedContent = (() => {
    try {
      return JSON.parse(contentPayload)
    } catch (error) {
      console.error('Invalid page content JSON', error)
      return existing.content ?? {}
    }
  })()

  const parsedSeo = (() => {
    try {
      return JSON.parse(seoPayload)
    } catch (error) {
      console.error('Invalid page SEO JSON', error)
      return existing.seo ?? {}
    }
  })()

  const nextStatus = statusValue === PageStatus.PUBLISHED ? PageStatus.PUBLISHED : PageStatus.DRAFT
  const baseSlug = rawSlug || slugify(title) || existing.slug
  const slug = await ensureUniqueSlug(baseSlug, id)

  const publishedAt = nextStatus === PageStatus.PUBLISHED ? (existing.publishedAt ?? new Date()) : null

  await prisma.page.update({
    where: { id },
    data: {
      title: title || existing.title,
      slug,
      template,
      status: nextStatus,
      content: parsedContent as unknown as Prisma.InputJsonValue,
      seo: parsedSeo as unknown as Prisma.InputJsonValue,
      publishedAt,
    },
  })

  revalidatePath('/admin/pages')
  revalidatePath(`/${slug}`)
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/${previousSlug}`)
  }
}

export async function updatePageStatus(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '').trim()
  const statusValue = String(formData.get('status') || PageStatus.DRAFT)
  if (!id) return

  const targetStatus = statusValue === PageStatus.PUBLISHED ? PageStatus.PUBLISHED : PageStatus.DRAFT

  const page = await prisma.page.update({
    where: { id },
    data: {
      status: targetStatus,
      publishedAt: targetStatus === PageStatus.PUBLISHED ? new Date() : null,
    },
  })

  revalidatePath('/admin/pages')
  revalidatePath(`/${page.slug}`)
}

export async function deletePage(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '').trim()
  if (!id) return

  const page = await prisma.page.delete({ where: { id } })

  revalidatePath('/admin/pages')
  revalidatePath(`/${page.slug}`)
}
