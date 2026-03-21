'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type CategoryOption = { id: string; name: string }

type Props = {
  isOpen: boolean
  onClose: () => void
  categories: CategoryOption[]
  service?: {
    id: string
    title: string
    slug: string
    price: number
    salePrice?: number | null
    priceUnit: string
    description?: string | null
    imageUrl?: string | null
    sortOrder: number
    isActive: boolean
    isFeatured: boolean
    categoryId?: string | null
  }
  action: (fd: FormData) => Promise<void>
  onSuccess?: (message: string) => void
}

export default function ServiceModal({ isOpen, onClose, categories, service, action, onSuccess }: Props) {
  const [title, setTitle] = useState(service?.title ?? '')
  const [slug, setSlug] = useState(service?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!service?.slug)
  const [price, setPrice] = useState<string>(service ? String(service.price) : '')
  const [salePrice, setSalePrice] = useState<string>(service?.salePrice != null ? String(service.salePrice) : '')
  const [priceUnit, setPriceUnit] = useState(service?.priceUnit ?? 'NPR')
  const [description, setDescription] = useState(service?.description ?? '')
  const [imageUrl, setImageUrl] = useState(service?.imageUrl ?? '')
  const [sortOrder, setSortOrder] = useState<number>(service?.sortOrder ?? 0)
  const [isActive, setIsActive] = useState<boolean>(service?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState<boolean>(service?.isFeatured ?? false)
  const [categoryId, setCategoryId] = useState<string>(service?.categoryId ?? '')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (service) {
      setTitle(service.title)
      setSlug(service.slug)
      setSlugTouched(true)
      setPrice(String(service.price))
      setSalePrice(service.salePrice != null ? String(service.salePrice) : '')
      setPriceUnit(service.priceUnit)
      setDescription(service.description ?? '')
      setImageUrl(service.imageUrl ?? '')
      setSortOrder(service.sortOrder)
      setIsActive(service.isActive)
      setIsFeatured(service.isFeatured)
      setCategoryId(service.categoryId ?? '')
    } else {
      setTitle('')
      setSlug('')
      setSlugTouched(false)
      setPrice('')
      setSalePrice('')
      setPriceUnit('NPR')
      setDescription('')
      setImageUrl('')
      setSortOrder(0)
      setIsActive(true)
      setIsFeatured(false)
      setCategoryId('')
    }
  }, [service, isOpen])

  const isEdit = !!service?.id

  const handleUpload = async (file: File) => {
    const body = new FormData()
    body.append('file', file)
    body.append('folder', 'astra-services')
    setUploading(true)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (res.ok && data?.url) {
        setImageUrl(data.url)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[85vh] overflow-y-auto thin-scrollbar">
          <div className="flex items-center justify-between px-4 py-3 border-b border-b-[oklch(.922_0_0)]">
            <Dialog.Title className="text-xl font-semibold">{isEdit ? 'Edit Service' : 'Add Service'}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700">×</button>
            </Dialog.Close>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData()
              if (isEdit) fd.append('id', service!.id)
              fd.append('title', title)
              fd.append('slug', slugTouched ? slug : slugify(title))
              fd.append('price', price)
              fd.append('salePrice', salePrice)
              fd.append('priceUnit', priceUnit)
              fd.append('description', description)
              fd.append('imageUrl', imageUrl)
              fd.append('sortOrder', String(sortOrder))
              fd.append('isActive', String(isActive))
              fd.append('isFeatured', String(isFeatured))
              fd.append('categoryId', categoryId)
              setSubmitting(true)
              try {
                await action(fd)
                onSuccess?.(isEdit ? 'Service updated' : 'Service created')
                onClose()
              } finally {
                setSubmitting(false)
              }
            }}
            className="p-4 space-y-4"
          >
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (!slugTouched) setSlug(slugify(e.target.value))
                }}
                className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                placeholder="Service title"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
                onBlur={() => setSlugTouched(true)}
                className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                placeholder="service-slug"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Price (original)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Sale Price (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                  placeholder="Leave empty for no discount"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Price Unit</label>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                >
                  <option value="NPR">NPR</option>
                  <option value="USD">USD</option>
                  <option value="CAD">CAD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-[oklch(.922_0_0)] rounded-md px-3 py-2 text-[13px] resize-none"
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Image</label>
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden border border-[oklch(.922_0_0)]">
                    <Image src={imageUrl} alt="Service" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <label className="flex flex-col items-center justify-center w-32 h-24 rounded-md border border-dashed border-[oklch(.922_0_0)] cursor-pointer hover:bg-gray-50">
                  <span className="text-[12px] text-gray-500">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f) }}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                  className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                >
                  <option value="">— No category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(c) => setIsActive(c === true)}
                  className="h-4 w-4 rounded border border-gray-300 flex items-center justify-center data-[state=checked]:bg-[#030e55] data-[state=checked]:border-[#030e55]"
                >
                  <Checkbox.Indicator>
                    <Check className="h-3 w-3 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="isActive" className="text-[13px] font-medium">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={(c) => setIsFeatured(c === true)}
                  className="h-4 w-4 rounded border border-gray-300 flex items-center justify-center data-[state=checked]:bg-[#030e55] data-[state=checked]:border-[#030e55]"
                >
                  <Checkbox.Indicator>
                    <Check className="h-3 w-3 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="isFeatured" className="text-[13px] font-medium">Featured — show in home page services section</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[oklch(.922_0_0)]">
              <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-[13px]">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-9 px-4 rounded-md bg-[#030e55] text-white text-[13px] font-semibold disabled:opacity-60"
              >
                {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
