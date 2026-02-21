'use client'

import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { PAGE_TEMPLATES, PageFieldDefinition } from '@/config/pageTemplates'
import { ReactNode } from 'react'

type PageStatusValue = 'DRAFT' | 'PUBLISHED'

const STATUS_OPTIONS: PageStatusValue[] = ['DRAFT', 'PUBLISHED']

export type PageRecord = {
  id: string
  title: string
  slug: string
  template: string
  status: PageStatusValue
  content: Record<string, unknown>
  seo: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

type Props = {
  isOpen: boolean
  onClose: () => void
  page: PageRecord | null
  action: (formData: FormData) => Promise<void>
  onSuccess?: (message: string) => void
}

type SeoState = {
  metaTitle: string
  metaDescription: string
  ogTitle: string
  ogDescription: string
  ogImage: string
}

type UploadState = Record<string, boolean>

const defaultSeoState: SeoState = {
  metaTitle: '',
  metaDescription: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
}

function coerceSeo(seo: Record<string, unknown> | null | undefined): SeoState {
  if (!seo || typeof seo !== 'object') return { ...defaultSeoState }
  return {
    metaTitle: typeof seo.metaTitle === 'string' ? seo.metaTitle : '',
    metaDescription: typeof seo.metaDescription === 'string' ? seo.metaDescription : '',
    ogTitle: typeof seo.ogTitle === 'string' ? seo.ogTitle : '',
    ogDescription: typeof seo.ogDescription === 'string' ? seo.ogDescription : '',
    ogImage: typeof seo.ogImage === 'string' ? seo.ogImage : '',
  }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function PageEditorDialog({ isOpen, onClose, page, action, onSuccess }: Props) {
  const template = page ? PAGE_TEMPLATES[page.template] : null
  const [activeContentTab, setActiveContentTab] = useState<string | null>(null)
  const [title, setTitle] = useState(page?.title ?? '')
  const [slug, setSlug] = useState(page?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(false)
  const [status, setStatus] = useState<PageStatusValue>(page?.status ?? 'DRAFT')
  const [seo, setSeo] = useState<SeoState>(coerceSeo(page?.seo))
  const [content, setContent] = useState<Record<string, unknown>>(page?.content ?? {})
  const [uploading, setUploading] = useState<UploadState>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (page) {
      setTitle(page.title)
      setSlug(page.slug)
      setStatus(page.status as PageStatusValue)
      setSeo(coerceSeo(page.seo))
      setContent(page.content ?? {})
      setSlugTouched(true)
    } else {
      setTitle('')
      setSlug('')
      setStatus('DRAFT')
      setSeo({ ...defaultSeoState })
      setContent({})
      setSlugTouched(false)
    }
    setActiveContentTab(null)
  }, [page, isOpen])

  // Get content sections from template (sections) or fallback to fields
  const contentSections = useMemo(() => {
    if (!template) return []
    
    // Use sections if available, otherwise create sections from fields (backward compatibility)
    if (template.sections) {
      return template.sections
    }
    
    // Fallback: if template has fields but no sections, create a single section
    if (template.fields && template.fields.length > 0) {
      return [{
        key: 'content',
        label: 'Content',
        fields: template.fields,
      }]
    }
    
    return []
  }, [template])

  // Set initial content tab when sections are available
  useEffect(() => {
    if (contentSections.length > 0 && (!activeContentTab || !contentSections.find(s => s.key === activeContentTab))) {
      setActiveContentTab(contentSections[0].key)
    }
  }, [contentSections, activeContentTab])

  const uploadImage = async (
    uploadKey: string,
    file: File,
    onUploaded: (url: string) => void
  ) => {
    setUploading((prev) => ({ ...prev, [uploadKey]: true }))
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (res.ok && data?.url) {
        onUploaded(data.url)
      }
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }))
    }
  }

  const buildDefaultObject = (fieldDefinitions?: PageFieldDefinition[]) => {
    if (!fieldDefinitions) return {}
    return fieldDefinitions.reduce<Record<string, unknown>>((acc, fieldDef) => {
      if (fieldDef.type === 'repeater') {
        acc[fieldDef.key] = []
      } else if (fieldDef.defaultValue !== undefined) {
        acc[fieldDef.key] = fieldDef.defaultValue
      } else {
        acc[fieldDef.key] = ''
      }
      return acc
    }, {})
  }

  const renderField = (
    field: PageFieldDefinition,
    value: unknown,
    onChange: (val: unknown) => void,
    fieldPath: string = field.key
  ): ReactNode => {
    const commonLabel = (
      <div className="flex items-center justify-between">
        <label className="text-[12px] text-gray-600">
          {field.label}{field.required && <span className="text-red-600"> *</span>}
        </label>
        {field.helperText && <span className="text-[11px] text-gray-400">{field.helperText}</span>}
      </div>
    )

    switch (field.type) {
      case 'text':
      case 'url':
        return (
          <div className="space-y-2">
            {commonLabel}
            <input
              type={field.type === 'url' ? 'url' : 'text'}
              value={typeof value === 'string' ? value : ''}
              required={field.required}
              placeholder={field.placeholder}
              onChange={(e) => onChange(e.target.value)}
              className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
            />
          </div>
        )
      case 'textarea':
      case 'richtext':
        return (
          <div className="space-y-2">
            {commonLabel}
            <textarea
              value={typeof value === 'string' ? value : ''}
              required={field.required}
              placeholder={field.placeholder}
              onChange={(e) => onChange(e.target.value)}
              className="w-full border border-[oklch(.922_0_0)] rounded-md px-3 py-2 text-[13px] min-h-[120px]"
              rows={field.type === 'richtext' ? 8 : 4}
            />
          </div>
        )
      case 'image': {
        const uploadKey = fieldPath
        const isUploading = !!uploading[uploadKey]
        return (
          <div className="space-y-2">
            {commonLabel}
            <div className="flex flex-col gap-3">
              {typeof value === 'string' && value ? (
                <div className="relative inline-block">
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => onChange('')}
                    className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow"
                  >
                    ×
                  </button>
                  <div className="w-32 aspect-video overflow-hidden rounded-md bg-gray-100">
                    <Image src={value} alt={field.label} width={200} height={150} className="h-full w-full object-cover" />
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[oklch(.922_0_0)] py-6 text-[13px] hover:bg-gray-50">
                  <span>{isUploading ? 'Uploading...' : 'Click to upload image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void uploadImage(uploadKey, file, (url) => onChange(url))
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        )
      }
      case 'repeater': {
        const items = Array.isArray(value)
          ? (value as Array<Record<string, unknown>>)
          : []
        const childFields = field.fields ?? []

        const addItem = () => {
          const defaults = buildDefaultObject(childFields)
          onChange([...items, defaults])
        }

        const removeItem = (index: number) => {
          const next = items.filter((_, i) => i !== index)
          onChange(next)
        }

        const updateItem = (index: number, nextItem: Record<string, unknown>) => {
          const next = items.map((item, i) => (i === index ? nextItem : item))
          onChange(next)
        }

        return (
          <div className="space-y-2">
            {commonLabel}
            <div className="space-y-4">
              {items.map((item, index) => {
                const itemValue =
                  typeof item === 'object' && item !== null
                    ? (item as Record<string, unknown>)
                    : {}
                const itemLabel =
                  field.itemLabel ? `${field.itemLabel} ${index + 1}` : `${field.label} ${index + 1}`

                return (
                  <div
                    key={`${fieldPath}-${index}`}
                    className="rounded-md border border-[oklch(.922_0_0)] bg-white p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-gray-700">{itemLabel}</span>
                      <button
                        type="button"
                        className="text-[12px] text-red-600 hover:underline"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {childFields.map((childField) => (
                        <div key={`${fieldPath}.${index}.${childField.key}`}>
                          {renderField(
                            childField,
                            itemValue[childField.key],
                            (childValue) => {
                              updateItem(index, {
                                ...itemValue,
                                [childField.key]: childValue,
                              })
                            },
                            `${fieldPath}.${index}.${childField.key}`
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center rounded-md border border-dashed border-[oklch(.922_0_0)] px-3 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50"
            >
              Add {field.itemLabel ?? 'Item'}
            </button>
          </div>
        )
      }
      default:
        return null
    }
  }

  if (!page || !template) {
    return null
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[92vh] overflow-auto thin-scrollbar">
          <div className="flex items-center justify-between px-5 py-4 border-b border-b-[oklch(.922_0_0)]">
            <Dialog.Title className="text-xl font-semibold">Edit {template.label}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700">×</button>
            </Dialog.Close>
          </div>
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              const formData = new FormData()
              formData.append('id', page.id)
              formData.append('title', title)
              formData.append('slug', slugTouched ? slug : slugify(title))
              formData.append('template', page.template)
              formData.append('status', status)
              formData.append('previousSlug', page.slug)
              formData.append('content', JSON.stringify(content ?? {}))
              formData.append('seo', JSON.stringify(seo ?? {}))

              setSubmitting(true)
              try {
                await action(formData)
                onClose()
                onSuccess?.('Page updated')
              } finally {
                setSubmitting(false)
              }
            }}
            className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-0 h-full"
          >
            <div className="overflow-y-auto thin-scrollbar px-5 py-4 space-y-5">
              <section className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[12px] text-gray-600">Title <span className="text-red-600">*</span></label>
                    <input
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
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] text-gray-600">Slug <span className="text-red-600">*</span></label>
                    <input
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value)
                        setSlugTouched(true)
                      }}
                      required
                      className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                    />
                    <p className="text-[11px] text-gray-500">URL path will be <span className="font-mono">/{slug || page.slug}</span></p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] text-gray-600">Template</label>
                    <input value={template.label} disabled className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px] bg-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] text-gray-600">Status</label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as PageStatusValue)}
                        className="h-9 w-full appearance-none border border-[oklch(.922_0_0)] rounded-md px-3 pr-8 text-[13px]"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option === 'PUBLISHED' ? 'Published' : 'Draft'}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4 text-gray-500">
                          <path fillRule="evenodd" d="M10 12a1 1 0 0 1-.7-.29l-4-4a1 1 0 1 1 1.4-1.42L10 9.59l3.3-3.3a1 1 0 0 1 1.4 1.42l-4 4A1 1 0 0 1 10 12Z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    {page.publishedAt && <p className="text-[11px] text-gray-500">Published {new Date(page.publishedAt).toLocaleString()}</p>}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Content</h3>
                {contentSections.length > 0 ? (
                  <>
                    {/* Content Tabs */}
                    <div className="border-b border-[oklch(.922_0_0)] mb-4">
                      <div className="flex flex-wrap gap-1">
                        {contentSections.map((section) => (
                          <button
                            key={section.key}
                            type="button"
                            onClick={() => setActiveContentTab(section.key)}
                            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                              (activeContentTab || contentSections[0]?.key) === section.key
                                ? 'border-[#030e55] text-[#030e55]'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {section.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Active Content Tab Content */}
                    {(() => {
                      const currentTabKey = activeContentTab || contentSections[0]?.key
                      if (!currentTabKey) {
                        return <p className="text-[13px] text-gray-500">No content sections available.</p>
                      }
                      
                      const activeSection = contentSections.find(s => s.key === currentTabKey)
                      if (!activeSection) {
                        return <p className="text-[13px] text-gray-500">Section not found.</p>
                      }
                      
                      if (activeSection.fields.length === 0) {
                        return <p className="text-[13px] text-gray-500">No fields in this section.</p>
                      }
                      
                      return (
                        <div className="space-y-4">
                          {activeSection.fields.map((field) => (
                            <div key={field.key}>
                              {renderField(
                                field,
                                content[field.key],
                                (newValue) => {
                                  setContent((prev) => ({
                                    ...prev,
                                    [field.key]: newValue,
                                  }))
                                },
                                field.key
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </>
                ) : (
                  <p className="text-[13px] text-gray-500">No editable fields defined for this template.</p>
                )}
              </section>
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-[oklch(.922_0_0)] bg-gray-50/60 px-5 py-4 space-y-5 overflow-y-auto thin-scrollbar">
              <section className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">SEO Settings</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[12px] text-gray-600">Meta Title</label>
                    <input
                      value={seo.metaTitle}
                      onChange={(e) => setSeo((prev) => ({ ...prev, metaTitle: e.target.value }))}
                      className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                      placeholder="Best quality meat in Nepal"
                    />
                    <p className="text-[11px] text-gray-500">{seo.metaTitle.length}/60 characters</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[12px] text-gray-600">Meta Description</label>
                    <textarea
                      value={seo.metaDescription}
                      onChange={(e) => setSeo((prev) => ({ ...prev, metaDescription: e.target.value }))}
                      className="w-full border border-[oklch(.922_0_0)] rounded-md px-3 py-2 text-[13px]"
                      rows={4}
                      placeholder="Short description shown in search results."
                    />
                    <p className="text-[11px] text-gray-500">{seo.metaDescription.length}/160 characters</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[12px] text-gray-600">
                      Social Media Title (OG Title)
                      <span className="text-[11px] text-gray-400 ml-1">- Shown when sharing on Facebook, Twitter, etc.</span>
                    </label>
                    <input
                      value={seo.ogTitle}
                      onChange={(e) => setSeo((prev) => ({ ...prev, ogTitle: e.target.value }))}
                      className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                      placeholder="Leave empty to use Meta Title"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[12px] text-gray-600">
                      Social Media Description (OG Description)
                      <span className="text-[11px] text-gray-400 ml-1">- Shown when sharing on Facebook, Twitter, etc.</span>
                    </label>
                    <textarea
                      value={seo.ogDescription}
                      onChange={(e) => setSeo((prev) => ({ ...prev, ogDescription: e.target.value }))}
                      className="w-full border border-[oklch(.922_0_0)] rounded-md px-3 py-2 text-[13px]"
                      rows={3}
                      placeholder="Leave empty to use Meta Description"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[12px] text-gray-600">
                      Social Media Image (OG Image)
                      <span className="text-[11px] text-gray-400 ml-1">- Image shown when sharing on social media</span>
                    </label>
                    <input
                      value={seo.ogImage}
                      onChange={(e) => setSeo((prev) => ({ ...prev, ogImage: e.target.value }))}
                      className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="col-span-full flex items-center justify-end gap-2 border-t border-[oklch(.922_0_0)] px-5 py-3">
              <Dialog.Close asChild>
                <button type="button" className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={submitting}
                className="h-9 px-4 rounded-md bg-[#030e55] text-white text-[13px] font-semibold disabled:opacity-60"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
