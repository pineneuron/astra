'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Wrench, Settings, Bell, Mail, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGeneralSettings, getNotificationSettings, getSmtpSettings, getWhatsAppSettings, updateGeneralSettings, updateNotificationSettings, updatePassword, updateProfile, updateSmtpSettings, updateWhatsAppSettings } from './actions'

type SettingsCategory = 'profile' | 'general' | 'notifications' | 'smtp' | 'whatsapp'

const settingsCategories = [
  { id: 'profile' as SettingsCategory, label: 'Profile', icon: Wrench },
  { id: 'general' as SettingsCategory, label: 'General', icon: Settings },
  { id: 'notifications' as SettingsCategory, label: 'Notifications', icon: Bell },
  { id: 'smtp' as SettingsCategory, label: 'SMTP', icon: Mail },
  { id: 'whatsapp' as SettingsCategory, label: 'WhatsApp', icon: Bell },
]

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialCategory = (() => {
    const tabParam = searchParams?.get('tab') as SettingsCategory | null
    const valid = settingsCategories.some(category => category.id === tabParam)
    return valid && tabParam ? tabParam : 'profile'
  })()

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialCategory)

  useEffect(() => {
    const tabParam = searchParams?.get('tab') as SettingsCategory | null
    const valid = settingsCategories.some(category => category.id === tabParam)
    const nextCategory = valid && tabParam ? tabParam : 'profile'

    setActiveCategory(prev => (prev === nextCategory ? prev : nextCategory))
  }, [searchParams])

  const handleCategorySelect = (category: SettingsCategory) => {
    setActiveCategory(category)
    const params = new URLSearchParams(searchParams?.toString())
    if (category === 'profile') {
      params.delete('tab')
    } else {
      params.set('tab', category)
    }

    const queryString = params.toString()
    const target = queryString ? `?${queryString}` : '/admin/settings'
    router.replace(target, { scroll: false })
  }

  const activeCategoryData = settingsCategories.find(cat => cat.id === activeCategory)
  const ActiveIcon = activeCategoryData?.icon || Wrench

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-sm text-gray-600">Manage your profile, global configuration, and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-10">
        {/* Sidebar Navigation */}
        <aside className="space-y-1">
          {settingsCategories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{category.label}</span>
              </button>
            )
          })}
        </aside>

        {/* Main Content Area */}
        <div className="bg-white border-gray-200">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <ActiveIcon className="h-6 w-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">{activeCategoryData?.label}</h2>
            </div>
            <p className="text-sm text-gray-600">
              {activeCategory === 'profile' && "Update your profile settings and personal preferences."}
              {activeCategory === 'general' && "Manage global site configuration and defaults."}
              {activeCategory === 'notifications' && "Control how the team receives alerts and updates."}
              {activeCategory === 'whatsapp' && "Configure WhatsApp Cloud API settings for order notifications."}
            </p>
          </div>

          <div className="space-y-6">
            {activeCategory === 'profile' && <ProfileSection />}
            {activeCategory === 'general' && <GeneralSection />}
            {activeCategory === 'notifications' && <NotificationsSection />}
            {activeCategory === 'smtp' && <SmtpSection />}
            {activeCategory === 'whatsapp' && <WhatsAppSection />}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSection() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [nameError, setNameError] = useState('')

  const [loadingProfile, setLoadingProfile] = useState(true)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setEmail(session.user.email || '')
      setImageUrl(session.user.image || '')
      setNameError('')
      setLoadingProfile(false)
    } else if (session === null) {
      setLoadingProfile(false)
    }
  }, [session])

  const handleUpload = async (file: File) => {
    const body = new FormData()
    body.append('file', file)
    setUploading(true)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (res.ok && data?.url) {
        setImageUrl(data.url)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="space-y-8">
        <div className="space-y-6 w-full lg:max-w-[75%]">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-24 w-full rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="border-t border-gray-200 pt-8">
          <div className="space-y-6 w-full lg:max-w-[75%]">
            <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-36 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setProfileError('')
    setProfileSuccess('')
    setNameError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Name is required')
      setSubmitting(false)
      return
    }

    const payload = {
      name: trimmedName,
      imageUrl: imageUrl ? imageUrl : null,
    }

    const result = await updateProfile(payload)

    if (result.ok) {
      setProfileSuccess('Profile updated successfully')
      setNameError('')
      setName(trimmedName)
      if (updateSession) {
        await updateSession({
          user: {
            ...(session?.user ?? {}),
            name: trimmedName,
            image: imageUrl || undefined,
          },
        })
      }
      router.refresh()
    } else {
      setProfileError(result.error || 'Failed to update profile')
    }
    setSubmitting(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')

    const result = await updatePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    })

    if (result.ok) {
      setPasswordSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setPasswordError(result.error || 'Failed to update password')
    }
    setChangingPassword(false)
  }

  return (
    <div className="space-y-8">
      {/* Profile Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-6 w-full lg:max-w-[75%]">
        {profileSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
            {profileSuccess}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-1.5">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {nameError ? (
            <p className="mt-1.5 text-xs text-red-600">{nameError}</p>
          ) : (
            <p className="mt-1.5 text-xs text-gray-500">
              This is the name that will be displayed on your profile and in emails.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            disabled
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Email cannot be changed. Contact support if you need to update your email.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Avatar
          </label>
          {!imageUrl && (
            <div className="rounded-md border border-gray-300 bg-white p-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-6 text-sm hover:bg-gray-50">
                <Upload className="h-4 w-4 text-gray-400" />
                <span>Click to upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleUpload(file)
                  }}
                />
              </label>
              {uploading && <div className="mt-2 text-xs text-gray-500">Uploading...</div>}
            </div>
          )}
          {imageUrl && (
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-300 text-red-600 shadow-sm hover:bg-red-50"
                aria-label="Remove avatar"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={imageUrl}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          <p className="mt-1.5 text-xs text-gray-500">
            Upload a profile picture. Recommended size: 200x200 pixels.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Updating...' : 'Update Profile'}
          </button>
          {profileError && (
            <p className="mt-2 text-sm text-red-600">{profileError}</p>
          )}
        </div>
      </form>

      {/* Password Change Form */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-6 w-full lg:max-w-[75%]">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
              {passwordSuccess}
            </div>
          )}

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-900 mb-1.5">
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-900 mb-1.5">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Password must be at least 6 characters long.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-1.5">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GeneralSection() {
  const router = useRouter()
  const [siteTitle, setSiteTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [adminEmail, setAdminEmail] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [titleError, setTitleError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [generalSuccess, setGeneralSuccess] = useState('')

  useEffect(() => {
    let ignore = false

    const loadSettings = async () => {
      setLoading(true)
      const result = await getGeneralSettings()
      if (ignore) return

      if (result.ok && result.data) {
        setSiteTitle(result.data.siteTitle ?? '')
        setTagline(result.data.tagline ?? '')
        setAdminEmail(result.data.adminEmail ?? '')
        setGeneralError('')
      } else {
        setGeneralError(result.error || 'Failed to load general settings')
      }
      setLoading(false)
    }

    void loadSettings()
    return () => {
      ignore = true
    }
  }, [])

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTitleError('')
    setEmailError('')
    setGeneralError('')
    setGeneralSuccess('')

    const trimmedTitle = siteTitle.trim()
    const trimmedEmail = adminEmail.trim()
    const trimmedTagline = tagline.trim()

    if (!trimmedTitle) {
      setTitleError('Site title is required')
      setSaving(false)
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address')
      setSaving(false)
      return
    }

    const result = await updateGeneralSettings({
      siteTitle: trimmedTitle,
      tagline: trimmedTagline,
      adminEmail: trimmedEmail
    })

    if (result.ok) {
      setGeneralSuccess('General settings updated successfully')
      setTitleError('')
      setEmailError('')
      setSiteTitle(trimmedTitle)
      setTagline(trimmedTagline)
      setAdminEmail(trimmedEmail)
      router.refresh()
    } else {
      setGeneralError(result.error || 'Failed to update general settings')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-8 w-full lg:max-w-[75%]">
        <div>
          <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div>
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-10 w-full rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-3 w-2/3 rounded bg-gray-200 animate-pulse" />
          </div>

          <div>
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-10 w-full rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
          </div>

          <div>
            <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-10 w-full rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="h-10 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-10 w-28 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleGeneralSubmit} className="space-y-6 w-full lg:max-w-[75%]">
      {generalSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
          {generalSuccess}
        </div>
      )}
      {generalError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {generalError}
        </div>
      )}

      <div>
        <label htmlFor="siteTitle" className="block text-sm font-semibold text-gray-900 mb-1.5">
          Site Title
        </label>
        <input
          id="siteTitle"
          name="siteTitle"
          type="text"
          value={siteTitle}
          onChange={(e) => setSiteTitle(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {titleError ? (
          <p className="mt-1.5 text-xs text-red-600">{titleError}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-500">This text appears in the browser title bar and search results.</p>
        )}
      </div>

      <div>
        <label htmlFor="tagline" className="block text-sm font-semibold text-gray-900 mb-1.5">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="A short description of your site"
        />
        <p className="mt-1.5 text-xs text-gray-500">Displayed in the browser title bar or header depending on theme.</p>
      </div>

      <div>
        <label htmlFor="adminEmail" className="block text-sm font-semibold text-gray-900 mb-1.5">
          Administration Email Address
        </label>
        <input
          id="adminEmail"
          name="adminEmail"
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {emailError ? (
          <p className="mt-1.5 text-xs text-red-600">{emailError}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-500">
            This address is used for administrative notifications. A confirmation email will be required when changed.
          </p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

function NotificationsSection() {
  const [orderEmailsInput, setOrderEmailsInput] = useState('')
  const [contactEmailsInput, setContactEmailsInput] = useState('')
  const [orderWhatsAppNumbersInput, setOrderWhatsAppNumbersInput] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [notificationError, setNotificationError] = useState('')
  const [notificationSuccess, setNotificationSuccess] = useState('')
  const [orderEmailError, setOrderEmailError] = useState('')
  const [contactEmailError, setContactEmailError] = useState('')

  useEffect(() => {
    let ignore = false

    const loadNotificationSettings = async () => {
      setLoading(true)
      const result = await getNotificationSettings()
      if (ignore) return

      if (result.ok && result.data) {
        setOrderEmailsInput(result.data.orderEmails.join('\n'))
        setContactEmailsInput(result.data.contactEmails.join('\n'))
        setOrderWhatsAppNumbersInput(result.data.orderWhatsAppNumbers?.join('\n') || '')
        setNotificationError('')
      } else {
        setNotificationError(result.error || 'Failed to load notification settings')
      }
      setLoading(false)
    }

    void loadNotificationSettings()
    return () => {
      ignore = true
    }
  }, [])

  const parseEmails = (value: string) =>
    value
      .split(/[\n,]+/)
      .map(email => email.trim())
      .filter(Boolean)

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setNotificationError('')
    setNotificationSuccess('')
    setOrderEmailError('')
    setContactEmailError('')

    const orderEmails = parseEmails(orderEmailsInput)
    const contactEmails = parseEmails(contactEmailsInput)
    const orderWhatsAppNumbers = orderWhatsAppNumbersInput
      .split(/[\n,]+/)
      .map(num => num.trim())
      .filter(Boolean)

    if (!orderEmails.length) {
      setOrderEmailError('Please provide at least one email address for order notifications')
      setSaving(false)
      return
    }

    if (!contactEmails.length) {
      setContactEmailError('Please provide at least one email address for contact form submissions')
      setSaving(false)
      return
    }

    const result = await updateNotificationSettings({
      orderEmails,
      contactEmails,
      orderWhatsAppNumbers
    })

    if (result.ok) {
      setNotificationSuccess('Notification preferences saved successfully')
      setOrderEmailsInput(orderEmails.join('\n'))
      setContactEmailsInput(contactEmails.join('\n'))
      setOrderWhatsAppNumbersInput(orderWhatsAppNumbers.join('\n'))
    } else {
      setNotificationError(result.error || 'Failed to update notification settings')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-8 w-full lg:max-w-[75%]">
        <div>
          <div className="h-5 w-36 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div>
            <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-24 w-full rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-3 w-2/3 rounded bg-gray-200 animate-pulse" />
          </div>

          <div>
            <div className="h-4 w-44 rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-24 w-full rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>

        <div className="h-10 w-36 rounded bg-gray-200 animate-pulse" />
      </div>
    )
  }

  return (
    <form onSubmit={handleNotificationSubmit} className="space-y-6 w-full lg:max-w-[75%]">
      {notificationSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
          {notificationSuccess}
        </div>
      )}
      {notificationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {notificationError}
        </div>
      )}

      <div>
        <label htmlFor="orderNotificationEmails" className="block text-sm font-semibold text-gray-900 mb-1.5">
          Order Notification Emails
        </label>
        <textarea
          id="orderNotificationEmails"
          name="orderNotificationEmails"
          value={orderEmailsInput}
          onChange={(e) => setOrderEmailsInput(e.target.value)}
          className="w-full min-h-[120px] resize-y px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="admin@3starfoods.com"
        />
        {orderEmailError ? (
          <p className="mt-1.5 text-xs text-red-600">{orderEmailError}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-500">
            Separate multiple email addresses with commas or new lines. All listed recipients will receive new order alerts.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contactNotificationEmails" className="block text-sm font-semibold text-gray-900 mb-1.5">
          Contact Form Emails
        </label>
        <textarea
          id="contactNotificationEmails"
          name="contactNotificationEmails"
          value={contactEmailsInput}
          onChange={(e) => setContactEmailsInput(e.target.value)}
          className="w-full min-h-[120px] resize-y px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="info@3starfoods.com"
        />
        {contactEmailError ? (
          <p className="mt-1.5 text-xs text-red-600">{contactEmailError}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-500">
            Messages submitted through the website contact form will be sent to these addresses.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="orderWhatsAppNumbers" className="block text-sm font-semibold text-gray-900 mb-1.5">
          Order Notification WhatsApp Numbers
        </label>
        <textarea
          id="orderWhatsAppNumbers"
          name="orderWhatsAppNumbers"
          value={orderWhatsAppNumbersInput}
          onChange={(e) => setOrderWhatsAppNumbersInput(e.target.value)}
          className="w-full min-h-[120px] resize-y px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="+9779812345678"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Separate multiple WhatsApp numbers with commas or new lines. All listed numbers will receive new order notifications via WhatsApp. Format: +9779812345678 (include country code).
        </p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Notification Settings'}
        </button>
      </div>
    </form>
  )
}

function SmtpSection() {
  const [host, setHost] = useState('')
  const [port, setPort] = useState('587')
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [hasPassword, setHasPassword] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [smtpError, setSmtpError] = useState('')
  const [smtpSuccess, setSmtpSuccess] = useState('')

  const [hostError, setHostError] = useState('')
  const [portError, setPortError] = useState('')
  const [userError, setUserError] = useState('')
  const [fromEmailError, setFromEmailError] = useState('')
  const [passwordHint, setPasswordHint] = useState('Enter the SMTP password')

  useEffect(() => {
    let ignore = false

    const loadSmtpSettings = async () => {
      setLoading(true)
      const result = await getSmtpSettings()
      if (ignore) return

      if (result.ok && result.data) {
        setHost(result.data.host ?? '')
        setPort(String(result.data.port ?? ''))
        setUser(result.data.user ?? '')
        setFromEmail(result.data.fromEmail ?? '')
        setFromName(result.data.fromName ?? '')
        setHasPassword(Boolean(result.data.hasPassword))
        setPasswordHint(result.data.hasPassword ? 'Leave blank to keep current password' : 'Enter the SMTP password')
        setSmtpError('')
      } else {
        setSmtpError(result.error || 'Failed to load SMTP settings')
      }
      setLoading(false)
    }

    void loadSmtpSettings()
    return () => {
      ignore = true
    }
  }, [])

  const handleSmtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSmtpError('')
    setSmtpSuccess('')
    setHostError('')
    setPortError('')
    setUserError('')
    setFromEmailError('')

    const trimmedHost = host.trim()
    const trimmedUser = user.trim()
    const trimmedFromEmail = fromEmail.trim()
    const trimmedFromName = fromName.trim()
    const trimmedPassword = password.trim()
    const parsedPort = Number(port)

    let hasValidationError = false

    if (!trimmedHost) {
      setHostError('SMTP host is required')
      hasValidationError = true
    }

    if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
      setPortError('Enter a valid port number')
      hasValidationError = true
    }

    if (!trimmedUser) {
      setUserError('SMTP username is required')
      hasValidationError = true
    }

    if (!trimmedFromEmail || !/^\S+@\S+\.\S+$/.test(trimmedFromEmail)) {
      setFromEmailError('Enter a valid sender email address')
      hasValidationError = true
    }

    if (hasValidationError) {
      setSaving(false)
      return
    }

    const result = await updateSmtpSettings({
      host: trimmedHost,
      port: parsedPort,
      user: trimmedUser,
      password: trimmedPassword ? trimmedPassword : undefined,
      fromEmail: trimmedFromEmail,
      fromName: trimmedFromName
    })

    if (result.ok) {
      setSmtpSuccess('SMTP settings saved successfully')
      const passwordNowConfigured = Boolean(trimmedPassword) || hasPassword
      setHasPassword(passwordNowConfigured)
      setPassword('')
      setPasswordHint(passwordNowConfigured ? 'Leave blank to keep current password' : 'Enter the SMTP password')
    } else {
      setSmtpError(result.error || 'Failed to update SMTP settings')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-8 w-full lg:max-w-[75%]">
        <div>
          <div className="h-5 w-28 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-60 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
        </div>

        <div className="h-10 w-36 rounded bg-gray-200 animate-pulse" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSmtpSubmit} className="space-y-6 w-full lg:max-w-[75%]">
      {smtpSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
          {smtpSuccess}
        </div>
      )}
      {smtpError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {smtpError}
        </div>
      )}

      <div>
        <label htmlFor="smtpHost" className="block text-sm font-semibold text-gray-900 mb-1.5">
          SMTP Host
        </label>
        <input
          id="smtpHost"
          name="smtpHost"
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="smtp.mailprovider.com"
        />
        {hostError ? (
          <p className="mt-1.5 text-xs text-red-600">{hostError}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-500">Hostname or IP address of your SMTP server.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="smtpPort" className="block text-sm font-semibold text-gray-900 mb-1.5">
            Port
          </label>
          <input
            id="smtpPort"
            name="smtpPort"
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="587"
          />
          {portError ? (
            <p className="mt-1.5 text-xs text-red-600">{portError}</p>
          ) : (
            <p className="mt-1.5 text-xs text-gray-500">Typically 587 (TLS) or 465 (SSL).</p>
          )}
        </div>

        <div>
          <label htmlFor="smtpUser" className="block text-sm font-semibold text-gray-900 mb-1.5">
            Username
          </label>
          <input
            id="smtpUser"
            name="smtpUser"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="noreply@3starfoods.com"
          />
          {userError ? (
            <p className="mt-1.5 text-xs text-red-600">{userError}</p>
          ) : (
            <p className="mt-1.5 text-xs text-gray-500">SMTP account username or email address.</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="smtpPassword" className="block text-sm font-semibold text-gray-900 mb-1.5">
          Password
        </label>
        <input
          id="smtpPassword"
          name="smtpPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={hasPassword ? '••••••••' : 'SMTP password'}
        />
        <p className="mt-1.5 text-xs text-gray-500">{passwordHint}</p>
      </div>

      <div>
        <label htmlFor="smtpFromEmail" className="block text-sm font-semibold text-gray-900 mb-1.5">
          From Email Address
        </label>
        <input
          id="smtpFromEmail"
          name="smtpFromEmail"
          type="email"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="noreply@3starfoods.com"
        />
        {fromEmailError ? (
          <p className="mt-1.5 text-xs text-red-600">{fromEmailError}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-500">Sender address shown in outgoing emails.</p>
        )}
      </div>

      <div>
        <label htmlFor="smtpFromName" className="block text-sm font-semibold text-gray-900 mb-1.5">
          From Name
        </label>
        <input
          id="smtpFromName"
          name="smtpFromName"
          type="text"
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="3 Star Foods"
        />
        <p className="mt-1.5 text-xs text-gray-500">Display name used for outgoing emails.</p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save SMTP Settings'}
        </button>
      </div>
    </form>
  )
}

function WhatsAppSection() {
  const [accessToken, setAccessToken] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [businessAccountId, setBusinessAccountId] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [whatsappError, setWhatsappError] = useState('')
  const [whatsappSuccess, setWhatsappSuccess] = useState('')
  const [accessTokenError, setAccessTokenError] = useState('')
  const [phoneNumberIdError, setPhoneNumberIdError] = useState('')

  useEffect(() => {
    let ignore = false

    const loadWhatsAppSettings = async () => {
      setLoading(true)
      const whatsappResult = await getWhatsAppSettings()
      const generalResult = await getGeneralSettings()
      if (ignore) return

      if (whatsappResult.ok && whatsappResult.data) {
        setAccessToken(whatsappResult.data.accessToken ?? '')
        setPhoneNumberId(whatsappResult.data.phoneNumberId ?? '')
        setBusinessAccountId(whatsappResult.data.businessAccountId ?? '')
      }

      if (generalResult.ok && generalResult.data) {
        setContactNumber(generalResult.data.whatsappContactNumber ?? '')
      }

      if (whatsappResult.ok && generalResult.ok) {
        setWhatsappError('')
      } else {
        setWhatsappError(whatsappResult.error || generalResult.error || 'Failed to load WhatsApp settings')
      }
      setLoading(false)
    }

    void loadWhatsAppSettings()
    return () => {
      ignore = true
    }
  }, [])

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setWhatsappError('')
    setWhatsappSuccess('')
    setAccessTokenError('')
    setPhoneNumberIdError('')

    const trimmedAccessToken = accessToken.trim()
    const trimmedPhoneNumberId = phoneNumberId.trim()
    const trimmedBusinessAccountId = businessAccountId.trim()

    let hasValidationError = false

    if (!trimmedAccessToken) {
      setAccessTokenError('WhatsApp Access Token is required')
      hasValidationError = true
    }

    if (!trimmedPhoneNumberId) {
      setPhoneNumberIdError('WhatsApp Phone Number ID is required')
      hasValidationError = true
    }

    if (hasValidationError) {
      setSaving(false)
      return
    }

    const whatsappResult = await updateWhatsAppSettings({
      accessToken: trimmedAccessToken,
      phoneNumberId: trimmedPhoneNumberId,
      businessAccountId: trimmedBusinessAccountId || undefined
    })

    // Also update the contact number in general settings
    // First get current general settings to preserve them
    const currentGeneral = await getGeneralSettings()
    const trimmedContactNumber = contactNumber.trim()
    
    let contactNumberResult = { ok: true }
    if (currentGeneral.ok && currentGeneral.data) {
      const result = await updateGeneralSettings({
        siteTitle: currentGeneral.data.siteTitle,
        tagline: currentGeneral.data.tagline,
        adminEmail: currentGeneral.data.adminEmail,
        whatsappContactNumber: trimmedContactNumber
      })
      contactNumberResult = result
    }

    if (whatsappResult.ok && contactNumberResult.ok) {
      setWhatsappSuccess('WhatsApp settings saved successfully')
    } else {
      setWhatsappError(whatsappResult.error || (contactNumberResult as { error?: string }).error || 'Failed to update WhatsApp settings')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-8 w-full lg:max-w-[75%]">
        <div>
          <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-72 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-44 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-52 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
          </div>
        </div>

        <div className="h-10 w-40 rounded bg-gray-200 animate-pulse" />
      </div>
    )
  }

  return (
    <form onSubmit={handleWhatsAppSubmit} className="space-y-6 w-full lg:max-w-[75%]">
      {whatsappSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
          {whatsappSuccess}
        </div>
      )}
      {whatsappError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {whatsappError}
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>WhatsApp Cloud API Setup:</strong> To get your credentials, go to{' '}
          <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline">
            Meta for Developers
          </a>
          {' '}and create a WhatsApp Business app. You&apos;ll need the Access Token and Phone Number ID from your app settings.
        </p>
      </div>

      <div>
        <label htmlFor="whatsappAccessToken" className="block text-sm font-semibold text-gray-900 mb-1.5">
          Access Token
        </label>
        <input
          id="whatsappAccessToken"
          name="whatsappAccessToken"
          type="password"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="EAAxxxxxxxxxxxxx"
        />
        {accessTokenError ? (
          <p className="mt-1.5 text-xs text-red-600">{accessTokenError}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-500">Your WhatsApp Cloud API access token from Meta for Developers.</p>
        )}
      </div>

      <div>
        <label htmlFor="whatsappPhoneNumberId" className="block text-sm font-semibold text-gray-900 mb-1.5">
          Phone Number ID
        </label>
        <input
          id="whatsappPhoneNumberId"
          name="whatsappPhoneNumberId"
          type="text"
          value={phoneNumberId}
          onChange={(e) => setPhoneNumberId(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="123456789012345"
        />
        {phoneNumberIdError ? (
          <p className="mt-1.5 text-xs text-red-600">{phoneNumberIdError}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-500">The Phone Number ID from your WhatsApp Business app.</p>
        )}
      </div>

      <div>
        <label htmlFor="whatsappBusinessAccountId" className="block text-sm font-semibold text-gray-900 mb-1.5">
          Business Account ID (Optional)
        </label>
        <input
          id="whatsappBusinessAccountId"
          name="whatsappBusinessAccountId"
          type="text"
          value={businessAccountId}
          onChange={(e) => setBusinessAccountId(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="123456789012345"
        />
        <p className="mt-1.5 text-xs text-gray-500">Optional: Your WhatsApp Business Account ID.</p>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Contact Number</h3>
        <div>
          <label htmlFor="whatsappContactNumber" className="block text-sm font-semibold text-gray-900 mb-1.5">
            WhatsApp Contact Number
          </label>
          <input
            id="whatsappContactNumber"
            name="whatsappContactNumber"
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+9779812345678"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            This number will be used for the floating WhatsApp button on the frontend. Format: +9779812345678 (include country code).
          </p>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save WhatsApp Settings'}
        </button>
      </div>
    </form>
  )
}
