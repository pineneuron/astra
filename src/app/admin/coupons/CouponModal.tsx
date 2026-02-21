'use client'

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { CouponType } from '@prisma/client'

type CouponLite = {
  id: string
  code: string
  name: string
  description: string | null
  type: CouponType
  value: number | string | null
  minOrderAmount: number | string | null
  maxDiscountAmount: number | string | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  usageLimit: number | null
}

type Props = {
  isOpen: boolean
  onClose: () => void
  coupon?: CouponLite
  onSuccess?: (message: string) => void
}

export default function CouponModal({ isOpen, onClose, coupon, onSuccess }: Props) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<CouponType>('PERCENTAGE')
  const [value, setValue] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code || '')
      setName(coupon.name || '')
      setDescription(coupon.description || '')
      setType(coupon.type)
      setValue(coupon.value != null ? String(coupon.value) : '')
      setMinOrderAmount(coupon.minOrderAmount != null ? String(coupon.minOrderAmount) : '')
      setMaxDiscountAmount(coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '')
      setStartDate(coupon.startDate ? coupon.startDate.slice(0,10) : '')
      setEndDate(coupon.endDate ? coupon.endDate.slice(0,10) : '')
      setUsageLimit(coupon.usageLimit != null ? String(coupon.usageLimit) : '')
      setIsActive(coupon.isActive)
    } else {
      setCode('')
      setName('')
      setDescription('')
      setType('PERCENTAGE')
      setValue('')
      setMinOrderAmount('')
      setMaxDiscountAmount('')
      setStartDate('')
      setEndDate('')
      setUsageLimit('')
      setIsActive(true)
    }
    setFormError('')
  }, [coupon, isOpen])

  const isEdit = !!coupon?.id

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[85vh] overflow-y-auto thin-scrollbar">
          <div className="flex items-center justify-between px-4 py-3 border-b border-b-[oklch(.922_0_0)]">
            <Dialog.Title className="text-xl font-semibold">{isEdit ? 'Edit Coupon' : 'Add Coupon'}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700">×</button>
            </Dialog.Close>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setFormError('')
              setSubmitting(true)
              const fd = new FormData(e.currentTarget)
              if (isEdit) fd.append('id', coupon!.id)
              try {
                const url = isEdit ? '/admin/coupons/actions/update' : '/admin/coupons/actions/create'
                const res = await fetch(url, { method: 'POST', body: fd })
                if (!res.ok) {
                  const msg = (await res.text()) || 'Failed to save coupon'
                  throw new Error(msg)
                }
                onClose()
                onSuccess?.(isEdit ? 'Coupon updated' : 'Coupon created')
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to save coupon'
                setFormError(msg)
              } finally {
                setSubmitting(false)
              }
            }}
            className="p-4 space-y-4"
          >
            {formError && (
              <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-[13px]">{formError}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Code</label>
                <input name="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px] font-mono" required />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Name</label>
                <input name="name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] text-gray-600 mb-1">Description</label>
                <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24 w-full border border-[oklch(.922_0_0)] rounded-md px-3 py-2 text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Type</label>
                <div className="relative">
                  <select name="type" value={type} onChange={(e) => setType(e.target.value as CouponType)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 pr-8 text-[13px] appearance-none">
                    {(['PERCENTAGE','FLAT','FREE_SHIPPING'] as CouponType[]).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4 text-gray-500"><path fillRule="evenodd" d="M10 12a1 1 0 0 1-.7-.29l-4-4a1 1 0 1 1 1.4-1.42L10 9.59l3.3-3.3a1 1 0 0 1 1.4 1.42l-4 4A1 1 0 0 1 10 12Z" clipRule="evenodd" /></svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Value</label>
                <input name="value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" required />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Min Order Amount</label>
                <input name="minOrderAmount" inputMode="decimal" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Max Discount Amount</label>
                <input name="maxDiscountAmount" inputMode="decimal" value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Start Date</label>
                <input name="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">End Date</label>
                <input name="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Usage Limit</label>
                <input name="usageLimit" type="number" min={0} value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" />
              </div>
              <div className="flex items-center gap-2">
                <input id="is-active" name="isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
                <label htmlFor="is-active" className="text-[13px]">Active</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
              <button type="submit" disabled={submitting} className="h-9 px-4 rounded-md bg-[#030e55] text-white text-[13px] font-semibold disabled:opacity-60">{submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Coupon')}</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
