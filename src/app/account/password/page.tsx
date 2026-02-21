'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { ValidationUtils } from '@/lib/utils'

export default function ChangePassword() {
  const router = useRouter()
  const { status } = useSession()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/account/password')
    }
  }, [status, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!currentPassword) {
      setError('Please enter your current password')
      return
    }

    // Validate password strength
    const passwordValidation = ValidationUtils.validatePassword(newPassword)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || 'Invalid password')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="h-6 w-6 text-[#030e55]" />
        <h1 className="text-2xl font-bold tsf-font-sora">Change Password</h1>
      </div>

      <p className="text-gray-600 mb-6">
        Update your password to keep your account secure.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Password <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
              placeholder="Enter your current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            New Password <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
              placeholder="Enter your new password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters and contain both letters and numbers</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm New Password <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
              placeholder="Confirm your new password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 tsf-bg-blue text-white rounded-full px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="h-5 w-5" />
            {saving ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  )
}

