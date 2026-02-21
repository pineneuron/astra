'use client'

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { PAGE_TEMPLATE_OPTIONS } from '@/config/pageTemplates'

const TEMPLATE_OPTIONS = PAGE_TEMPLATE_OPTIONS

type PageLite = {
  id?: string
  title?: string
  slug?: string
  template?: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  action: (formData: FormData) => Promise<void>
  onSuccess?: (message: string) => void
  page?: PageLite
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function PageModal({ isOpen, onClose, action, onSuccess, page }: Props) {
  const [title, setTitle] = useState(page?.title ?? '')
  const [slug, setSlug] = useState(page?.slug ?? '')
  const [template, setTemplate] = useState(page?.template ?? TEMPLATE_OPTIONS[0]?.value ?? '')
  const [slugTouched, setSlugTouched] = useState(!!page?.slug)
  const [submitting, setSubmitting] = useState(false)

  const isEdit = Boolean(page?.id)

  useEffect(() => {
    if (page) {
      setTitle(page.title ?? '')
      setSlug(page.slug ?? '')
      setTemplate(page.template ?? TEMPLATE_OPTIONS[0]?.value ?? '')
      setSlugTouched(!!page.slug)
    } else {
      setTitle('')
      setSlug('')
      setTemplate(TEMPLATE_OPTIONS[0]?.value ?? '')
      setSlugTouched(false)
    }
  }, [page, isOpen])

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[85vh] overflow-y-auto thin-scrollbar">
          <div className="flex items-center justify-between px-4 py-3 border-b border-b-[oklch(.922_0_0)]">
            <Dialog.Title className="text-xl font-semibold">{isEdit ? 'Update Page Settings' : 'Create Page'}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700">×</button>
            </Dialog.Close>
          </div>
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              const fd = new FormData(event.currentTarget)
              if (!slugTouched) {
                fd.set('slug', slugify(title))
              }
              setSubmitting(true)
              try {
                await action(fd)
                onClose()
                onSuccess?.(isEdit ? 'Page updated' : 'Page created')
              } finally {
                setSubmitting(false)
              }
            }}
            className="p-4 space-y-4"
          >
            {isEdit && <input type="hidden" name="id" value={page!.id} />}
            <div className="space-y-2">
              <label className="block text-[12px] text-gray-600">Page Title <span className="text-red-600">*</span></label>
              <input
                name="title"
                value={title}
                onChange={(e) => {
                  const value = e.target.value
                  setTitle(value)
                  if (!slugTouched) {
                    setSlug(slugify(value))
                  }
                }}
                required
                className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                placeholder="Enter page title"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[12px] text-gray-600">Slug <span className="text-red-600">*</span></label>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugTouched(true)
                }}
                required
                className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                placeholder="unique-page-slug"
              />
              <p className="text-[11px] text-gray-500">This determines the URL path. Example: <span className="font-mono">/slug</span>.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-[12px] text-gray-600">Template <span className="text-red-600">*</span></label>
              <select
                name="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                required
                disabled={isEdit}
              >
                {TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {isEdit && <p className="text-[11px] text-gray-500">Template cannot be changed once the page is created.</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
              <button type="submit" disabled={submitting} className="h-9 px-4 rounded-md bg-[#030e55] text-white text-[13px] font-semibold disabled:opacity-60">
                {submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Page')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
