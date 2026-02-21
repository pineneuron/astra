'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Save } from 'lucide-react'

export default function AccountDetails() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Kathmandu')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/account/details')
      return
    }

    if (status === 'authenticated' && session?.user) {
      // Fetch customer data
      fetchCustomerData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router])

  async function fetchCustomerData() {
    if (!session?.user?.email) return

    try {
      setLoading(true)
      const res = await fetch('/api/account/customer')
      if (!res.ok) throw new Error('Failed to fetch customer data')
      
      const data = await res.json()
      if (data.customer) {
        setName(data.customer.name || '')
        setEmail(data.customer.email || session.user.email || '')
        setPhone(data.customer.phone || '')
        setCity(data.customer.city || 'Kathmandu')
        setAddress(data.customer.address || '')
        setLandmark(data.customer.landmark || '')
      } else if (session.user.name) {
        // If no customer exists, initialize from user data
        setName(session.user.name)
        setEmail(session.user.email || '')
      }
    } catch {
      setError('Failed to load account details')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          city,
          address,
          landmark
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update account')
      }

      setSuccess('Account details updated successfully!')
      
      // Update session
      await update()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
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
        <User className="h-6 w-6 text-[#030e55]" />
        <h1 className="text-2xl font-bold tsf-font-sora">Account Details</h1>
      </div>

      <p className="text-gray-600 mb-6">
        Update your account information below. Your email address cannot be changed.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
              placeholder="+977 98XXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              City
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
              >
                <option value="Kathmandu">Kathmandu</option>
                <option value="Bhaktapur">Bhaktapur</option>
                <option value="Lalitpur">Lalitpur</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5 text-gray-500">
                  <path fillRule="evenodd" d="M10 12a1 1 0 0 1-.7-.29l-4-4a1 1 0 1 1 1.4-1.42L10 9.59l3.3-3.3a1 1 0 0 1 1.4 1.42l-4 4A1 1 0 0 1 10 12Z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
              placeholder="Street address"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Landmark
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
              placeholder="Nearby landmark (optional)"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 tsf-bg-blue text-white rounded-full px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
