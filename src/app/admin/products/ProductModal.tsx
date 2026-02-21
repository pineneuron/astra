'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import * as Checkbox from '@radix-ui/react-checkbox'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, Star, Trash2, ImagePlus, GripVertical } from 'lucide-react'

type CategoryLite = { id: string; name: string }

type ImageItem = { url: string; publicId?: string; isPrimary: boolean; sortOrder: number; id: string }

function SortableImageItem({ img, onRemove, onClick }: { img: ImageItem; onRemove: () => void; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className="relative">
      {img.isPrimary && (
        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded bg-[#030e55] px-2 py-0.5 text-[11px] font-semibold text-white">
          <Star className="h-3 w-3 fill-current" /> Featured
        </span>
      )}
      <button
        type="button"
        aria-label="Remove image"
        className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow hover:bg-white"
        onClick={(e) => { e.stopPropagation(); onRemove() }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <div className="absolute left-2 bottom-2 z-10 cursor-move" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5 text-white/90 bg-black/50 rounded p-0.5" />
      </div>
      <button
        type="button"
        onClick={onClick}
        className="w-full aspect-square rounded-md overflow-hidden"
      >
        <Image src={img.url} alt="product" width={160} height={160} className="w-full h-full object-cover" />
      </button>
    </div>
  )
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type Props = {
  isOpen: boolean
  onClose: () => void
  categories: CategoryLite[]
  product?: {
    id: string
    name: string
    slug: string
    categoryId: string
    selectedCategoryIds?: string[]
    basePrice: number
    salePrice?: number | null
    unit: string
    sortOrder: number
    isFeatured: boolean
    isBestseller: boolean
    description?: string | null
    shortDescription?: string | null
    isActive?: boolean
    images?: Array<{ imageUrl: string; publicId?: string | null; sortOrder: number; isPrimary: boolean }>
  }
  action: (fd: FormData) => Promise<void>
  onSuccess?: (message: string) => void
}

export default function ProductModal({ isOpen, onClose, categories, product, action, onSuccess }: Props) {
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(false)
  const [categoryIds, setCategoryIds] = useState<string[]>(product?.selectedCategoryIds && product.selectedCategoryIds.length > 0 ? product.selectedCategoryIds : (product ? [product.categoryId] : []))
  const [basePrice, setBasePrice] = useState<string>(product ? String(product.basePrice) : '')
  const [salePrice, setSalePrice] = useState<string>(product?.salePrice != null ? String(product.salePrice) : '')
  const [unit, setUnit] = useState(product?.unit ?? 'per kg')
  const [sortOrder, setSortOrder] = useState<number>(product?.sortOrder ?? 0)
  const [isFeatured, setIsFeatured] = useState<boolean>(product?.isFeatured ?? false)
  const [isBestseller, setIsBestseller] = useState<boolean>(product?.isBestseller ?? false)
  const [isActive, setIsActive] = useState<boolean>(product?.isActive ?? true)
  const [description, setDescription] = useState<string>(product?.description ?? '')
  const [shortDescription, setShortDescription] = useState<string>(product?.shortDescription ?? '')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (product) {
      setName(product.name)
      setSlug(product.slug)
      setSlugTouched(true)
      setCategoryIds(product.selectedCategoryIds && product.selectedCategoryIds.length > 0 ? product.selectedCategoryIds : [product.categoryId])
      setBasePrice(String(product.basePrice))
      setSalePrice(product?.salePrice != null ? String(product.salePrice) : '')
      setUnit(product.unit)
      setSortOrder(product.sortOrder)
      setIsFeatured(product.isFeatured)
      setIsBestseller(product.isBestseller)
      setIsActive(product?.isActive ?? true)
      setDescription((product.description as string) || '')
      setShortDescription((product.shortDescription as string) || '')
      if (product.images && product.images.length > 0) {
        setImages(product.images
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((im, idx) => ({ id: `img-pre-${idx}`, url: im.imageUrl, publicId: im.publicId || undefined, isPrimary: im.isPrimary, sortOrder: im.sortOrder })))
      } else {
        setImages([])
      }
    } else {
      setName('')
      setSlug('')
      setSlugTouched(false)
      setCategoryIds([])
      setBasePrice('')
      setSalePrice('')
      setUnit('per kg')
      setSortOrder(0)
      setIsFeatured(false)
      setIsBestseller(false)
      setIsActive(true)
      setDescription('')
      setShortDescription('')
      setImages([])
    }
  }, [product, isOpen])

  const isEdit = !!product?.id

  const handleUpload = async (file: File) => {
    const body = new FormData()
    body.append('file', file)
    setUploading(true)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (res.ok && data?.url) {
        setImages((prev) => {
          const next = [...prev, { url: data.url as string, publicId: data.publicId as string | undefined, isPrimary: prev.length === 0, sortOrder: prev.length, id: `img-${Date.now()}-${prev.length}` }]
          return next
        })
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[85vh] overflow-y-auto thin-scrollbar">
          <div className="flex items-center justify-between px-4 py-3 border-b border-b-[oklch(.922_0_0)]">
            <Dialog.Title className="text-xl font-semibold">{isEdit ? 'Edit Product' : 'Add Product'}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700">×</button>
            </Dialog.Close>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const newErrors: Record<string, string> = {}
              if (!name.trim()) newErrors.name = 'Name is required'
              if (!slug.trim()) newErrors.slug = 'Slug is required'
              if (categoryIds.length === 0) newErrors.categories = 'Select at least one category'
              const bpNum = Number(basePrice)
              if (basePrice.trim() === '' || Number.isNaN(bpNum) || bpNum <= 0) newErrors.basePrice = 'Price must be a number greater than 0'
              setErrors(newErrors)
              if (Object.keys(newErrors).length > 0) return
              const formEl = e.currentTarget as HTMLFormElement
              const fd = new FormData(formEl)
              setSubmitting(true)
              try {
                await action(fd)
                onClose()
                onSuccess?.(product?.id ? 'Product updated' : 'Product created')
              } finally {
                setSubmitting(false)
              }
            }}
            className="p-4 space-y-3"
          >
          {isEdit && <input type="hidden" name="id" value={product!.id} />}
          <div className="space-y-5">
            {/* General */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Name <span className="text-red-600">*</span></label>
                  <input name="name" value={name} onChange={(e) => { const v = e.target.value; setName(v); if (!slugTouched) setSlug(slugify(v)) }} className={`h-9 w-full rounded-md px-3 text-[13px] border ${errors.name ? 'border-red-400' : 'border-[oklch(.922_0_0)]'}`} required aria-invalid={!!errors.name} />
                  {errors.name && <p className="mt-1 text-[12px] text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Slug <span className="text-red-600">*</span></label>
                  <input name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }} className={`h-9 w-full rounded-md px-3 text-[13px] border ${errors.slug ? 'border-red-400' : 'border-[oklch(.922_0_0)]'}`} required aria-invalid={!!errors.slug} />
                  {errors.slug && <p className="mt-1 text-[12px] text-red-600">{errors.slug}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[12px] text-gray-600 mb-1">Categories <span className="text-red-600">*</span></label>
                  <div className="max-h-40 overflow-auto thin-scrollbar rounded-md border border-[oklch(.922_0_0)] p-2">
                    {categories.map((c) => {
                      const checked = categoryIds.includes(c.id)
                      return (
                        <label key={c.id} className="flex items-center gap-2 py-1 text-[13px]">
                          <Checkbox.Root
                            checked={checked}
                            onCheckedChange={(v) => {
                              setCategoryIds((prev) => v ? Array.from(new Set([...prev, c.id])) : prev.filter(id => id !== c.id))
                            }}
                            className="h-4 w-4 rounded border border-[oklch(.922_0_0)]"
                          >
                            <Checkbox.Indicator>
                              <Check className="h-3 w-3" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          <span>{c.name}</span>
                        </label>
                      )
                    })}
                  </div>
                  <input type="hidden" name="categoryIds" value={categoryIds.join(',')} />
                  <input type="hidden" name="categoryId" value={categoryIds[0] || ''} />
                  {errors.categories && <p className="mt-1 text-[12px] text-red-600">{errors.categories}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1">Regular Price <span className="text-red-600">*</span></label>
                    <input name="basePrice" type="number" step="0.01" min="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={`h-9 w-full rounded-md px-3 text-[13px] border ${errors.basePrice ? 'border-red-400' : 'border-[oklch(.922_0_0)]'}`} aria-invalid={!!errors.basePrice} />
                    {errors.basePrice && <p className="mt-1 text-[12px] text-red-600">{errors.basePrice}</p>}
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1">Sale Price</label>
                    <input name="salePrice" type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-[oklch(.922_0_0)] rounded-md px-3 py-2 text-[13px]"
                />
              </div>
              <div className="hidden">
                <label className="block text-[12px] text-gray-600 mb-1">Short Description</label>
                <textarea
                  name="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  className="w-full border border-[oklch(.922_0_0)] rounded-md px-3 py-2 text-[13px]"
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Images</label>
                <div className="rounded-md border border-[oklch(.922_0_0)] bg-white p-3">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[oklch(.922_0_0)] py-6 text-[13px] hover:bg-gray-50">
                    <ImagePlus className="h-4 w-4" />
                    <span>Click to upload images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => { const files = Array.from(e.target.files || []); files.forEach((f) => void handleUpload(f)) }}
                    />
                  </label>
                  {uploading && <div className="mt-2 text-[12px] text-gray-500">Uploading...</div>}
                </div>
                {images.length > 0 && (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
                    const { active, over } = e
                    if (!over || active.id === over.id) return
                    const sorted = images.slice().sort((a, b) => a.sortOrder - b.sortOrder)
                    const oldIndex = sorted.findIndex((it) => it.id === active.id)
                    const newIndex = sorted.findIndex((it) => it.id === over.id)
                    const reordered = arrayMove(sorted, oldIndex, newIndex)
                    setImages(reordered.map((it, i) => ({ ...it, sortOrder: i })))
                  }}>
                    <SortableContext items={images.map((it) => it.id)} strategy={verticalListSortingStrategy}>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {images
                          .slice()
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((img) => (
                            <SortableImageItem
                              key={img.id}
                              img={img}
                              onRemove={() => {
                                const filtered = images.filter((it) => it.id !== img.id)
                                setImages(filtered.map((it, i) => ({ ...it, sortOrder: i })))
                              }}
                              onClick={() => setImages((prev) => prev.map((it) => ({ ...it, isPrimary: it.id === img.id })))}
                            />
                          ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {/* Additional */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Unit</label>
                  <input name="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Sort Order</label>
                  <input name="sortOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} value="true" /> Active</label>
                <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} value="true" /> Featured</label>
                <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="isBestseller" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} value="true" /> Bestseller</label>
              </div>
            </div>

          </div>

          <input type="hidden" name="images" value={JSON.stringify(images)} />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
            <button type="submit" disabled={uploading || submitting} className="h-9 px-4 rounded-md bg-[#030e55] text-white text-[13px] font-semibold disabled:opacity-60">
              {submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
