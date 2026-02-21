'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'

type CategoryLite = {
  id: string
  name: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  parents: CategoryLite[]
  // If editing
  category?: {
    id: string
    name: string
    slug: string
    sortOrder: number
    isActive: boolean
    parentId?: string | null
    imageUrl?: string | null
    imagePublicId?: string | null
    iconUrl?: string | null
    iconPublicId?: string | null
  }
  action: (formData: FormData) => Promise<void>
  onSuccess?: (message: string) => void
}

export default function CategoryModal({ isOpen, onClose, parents, category, action, onSuccess }: Props) {
  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!category?.slug)
  const [sortOrder, setSortOrder] = useState<number>(category?.sortOrder ?? 0)
  const [parentId, setParentId] = useState<string | ''>(category?.parentId ?? '')
  const [imageUrl, setImageUrl] = useState<string>(category?.imageUrl ?? '')
  const [imagePublicId, setImagePublicId] = useState<string>(category?.imagePublicId ?? '')
  const [iconUrl, setIconUrl] = useState<string>(category?.iconUrl ?? '')
  const [iconPublicId, setIconPublicId] = useState<string>(category?.iconPublicId ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setSlug(category.slug)
      setSlugTouched(true)
      setSortOrder(category.sortOrder ?? 0)
      setParentId(category.parentId ?? '')
      setImageUrl(category.imageUrl ?? '')
      setImagePublicId(category.imagePublicId ?? '')
      setIconUrl(category.iconUrl ?? '')
      setIconPublicId(category.iconPublicId ?? '')
    } else {
      setName('')
      setSlug('')
      setSlugTouched(false)
      setSortOrder(0)
      setParentId('')
      setImageUrl('')
      setImagePublicId('')
      setIconUrl('')
      setIconPublicId('')
    }
  }, [category, isOpen])
  const slugify = (input: string) => input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')


  const isEdit = !!category?.id

  const handleUpload = async (file: File) => {
    const body = new FormData()
    body.append('file', file)
    setUploading(true)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (res.ok && data?.url) {
        setImageUrl(data.url)
        setImagePublicId(data.publicId || '')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleIconUpload = async (file: File) => {
    const body = new FormData()
    body.append('file', file)
    setUploadingIcon(true)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (res.ok && data?.url) {
        setIconUrl(data.url)
        setIconPublicId(data.publicId || '')
      }
    } finally {
      setUploadingIcon(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[85vh] overflow-y-auto thin-scrollbar">
        <div className="flex items-center justify-between px-4 py-3 border-b border-b-[oklch(.922_0_0)]">
          <Dialog.Title className="text-xl font-semibold">{isEdit ? 'Edit Category' : 'Add Category'}</Dialog.Title>
          <Dialog.Close asChild>
            <button aria-label="Close" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700">×</button>
          </Dialog.Close>
        </div>
        <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setSubmitting(true); try { await action(fd); onClose(); onSuccess?.(isEdit ? 'Category updated' : 'Category created') } finally { setSubmitting(false) } }} className="p-4 space-y-3">
          {isEdit && <input type="hidden" name="id" value={category!.id} />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-gray-600 mb-1">Name <span className="text-red-600">*</span></label>
              <input name="name" value={name} onChange={(e) => { const v = e.target.value; setName(v); if (!slugTouched) setSlug(slugify(v)) }} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" required />
            </div>
            <div>
              <label className="block text-[12px] text-gray-600 mb-1">Slug <span className="text-red-600">*</span></label>
              <input name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" required />
            </div>
            <div>
              <label className="block text-[12px] text-gray-600 mb-1">Parent Category</label>
              <select name="parentId" value={parentId} onChange={(e) => setParentId(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]">
                <option value="">None</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] text-gray-600 mb-1">Sort Order</label>
              <input name="sortOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-gray-600 mb-1">Featured Image</label>
            {!imageUrl && (
              <div className="rounded-md border border-[oklch(.922_0_0)] bg-white p-3">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[oklch(.922_0_0)] py-6 text-[13px] hover:bg-gray-50">
                  <span>Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f) }}
                  />
                </label>
                {uploading && <div className="mt-2 text-[12px] text-gray-500">Uploading...</div>}
              </div>
            )}
            {imageUrl && (
              <div className="relative inline-block mt-3">
                <button type="button" aria-label="Remove" onClick={() => { setImageUrl(''); setImagePublicId('') }} className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow">×</button>
                <div className="w-28 aspect-square overflow-hidden rounded-md">
                  <Image src={imageUrl} alt="category" width={160} height={160} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            <input type="hidden" name="imageUrl" value={imageUrl} />
            <input type="hidden" name="imagePublicId" value={imagePublicId} />
          </div>

          <div>
            <label className="block text-[12px] text-gray-600 mb-1">Category Icon</label>
            {!iconUrl && (
              <div className="rounded-md border border-[oklch(.922_0_0)] bg-white p-3">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[oklch(.922_0_0)] py-6 text-[13px] hover:bg-gray-50">
                  <span>Click to upload icon</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleIconUpload(f) }}
                  />
                </label>
                {uploadingIcon && <div className="mt-2 text-[12px] text-gray-500">Uploading...</div>}
              </div>
            )}
            {iconUrl && (
              <div className="relative inline-block mt-3">
                <button type="button" aria-label="Remove" onClick={() => { setIconUrl(''); setIconPublicId('') }} className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow">×</button>
                <div className="w-28 aspect-square overflow-hidden rounded-md">
                  <Image src={iconUrl} alt="category icon" width={160} height={160} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            <input type="hidden" name="iconUrl" value={iconUrl} />
            <input type="hidden" name="iconPublicId" value={iconPublicId} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
            <button type="submit" disabled={uploading || uploadingIcon || submitting} className="h-9 px-4 rounded-md bg-[#030e55] text-white text-[13px] font-semibold disabled:opacity-60">
              {submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Category')}
            </button>
          </div>
        </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}


