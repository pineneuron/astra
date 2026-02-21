'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import type { Role } from '@prisma/client'

type Props = {
  isOpen: boolean
  onClose: () => void
  user?: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: Role
  }
  action: (fd: FormData) => Promise<void>
  onSuccess?: (message: string) => void
}

export default function UserModal({ isOpen, onClose, user, action, onSuccess }: Props) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState<Role>(user?.role ?? 'CUSTOMER')
  const [imageUrl, setImageUrl] = useState<string>(user?.image ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setEmail(user.email ?? '')
      setRole(user.role)
      setImageUrl(user.image ?? '')
    } else {
      setName('')
      setEmail('')
      setRole('CUSTOMER')
      setImageUrl('')
    }
    setPassword('')
    setConfirmPassword('')
    setFormError('')
  }, [user, isOpen])

  const isEdit = !!user?.id

  const handleUpload = async (file: File) => {
    const body = new FormData()
    body.append('file', file)
    setUploading(true)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (res.ok && data?.url) setImageUrl(data.url)
    } finally { setUploading(false) }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[85vh] overflow-y-auto thin-scrollbar">
          <div className="flex items-center justify-between px-4 py-3 border-b border-b-[oklch(.922_0_0)]">
            <Dialog.Title className="text-xl font-semibold">{isEdit ? 'Edit User' : 'Add User'}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700">×</button>
            </Dialog.Close>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            if (isEdit) fd.append('id', user!.id)
            const pw = fd.get('password') as string | null
            const cpw = fd.get('confirmPassword') as string | null
            if (!isEdit) {
              if (!pw || !cpw || pw !== cpw) return
            } else {
              if (!pw) fd.delete('password')
            }
            fd.delete('confirmPassword')
            setFormError('')
            setSubmitting(true)
            try {
              await action(fd)
              onClose()
              onSuccess?.(isEdit ? 'User updated' : 'User created')
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Failed to save user'
              setFormError(msg)
              return
            } finally { setSubmitting(false) }
          }} className="p-4 space-y-3">
            {formError && (
              <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-[13px]">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Name</label>
                <input name="name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" required />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Email</label>
                <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]" required />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Role</label>
                <div className="relative">
                  <select
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 pr-8 text-[13px] appearance-none"
                  >
                    {(['ADMIN','MANAGER','STAFF','CUSTOMER'] as Role[]).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4 text-gray-500">
                      <path fillRule="evenodd" d="M10 12a1 1 0 0 1-.7-.29l-4-4a1 1 0 1 1 1.4-1.42L10 9.59l3.3-3.3a1 1 0 0 1 1.4 1.42l-4 4A1 1 0 0 1 10 12Z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                  placeholder={isEdit ? 'Leave blank to keep current password' : ''}
                  required={!isEdit}
                />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                  required={!isEdit}
                />
                {(!isEdit && password && confirmPassword && password !== confirmPassword) && (
                  <div className="mt-1 text-[12px] text-red-600">Passwords do not match</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-gray-600 mb-1">Avatar</label>
              {!imageUrl && (
                <div className="rounded-md border border-[oklch(.922_0_0)] bg-white p-3">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[oklch(.922_0_0)] py-6 text-[13px] hover:bg-gray-50">
                    <span>Click to upload image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f) }} />
                  </label>
                  {uploading && <div className="mt-2 text-[12px] text-gray-500">Uploading...</div>}
                </div>
              )}
              {imageUrl && (
                <div className="relative inline-block mt-3">
                  <button type="button" aria-label="Remove" onClick={() => setImageUrl('')} className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow">×</button>
                  <div className="w-24 aspect-square overflow-hidden rounded-full">
                    <Image src={imageUrl} alt="avatar" width={96} height={96} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              <input type="hidden" name="imageUrl" value={imageUrl} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
              <button type="submit" disabled={uploading || submitting || (!isEdit && (!!password && !!confirmPassword && password !== confirmPassword))} className="h-9 px-4 rounded-md bg-[#030e55] text-white text-[13px] font-semibold disabled:opacity-60">{submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create User')}</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
