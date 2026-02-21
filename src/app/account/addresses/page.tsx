'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Edit, Trash2, Map } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

interface Address {
  id: string
  type: string
  name: string
  address: string
  city: string
  landmark?: string | null
  coordinates?: { lat: number; lng: number } | null
  isDefault: boolean
}

export default function AccountAddresses() {
  const router = useRouter()
  const { status } = useSession()
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [type, setType] = useState('home')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('Kathmandu')
  const [landmark, setLandmark] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/account/addresses')
      return
    }

    if (status === 'authenticated') {
      fetchAddresses()
    }
  }, [status, router])

  async function fetchAddresses() {
    try {
      setLoading(true)
      const res = await fetch('/api/account/addresses')
      if (!res.ok) throw new Error('Failed to fetch addresses')
      
      const data = await res.json()
      setAddresses(data.addresses || [])
    } catch {
      setError('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  function openModal(address?: Address) {
    if (address) {
      setEditingAddress(address)
      setType(address.type)
      setName(address.name)
      setAddress(address.address)
      setCity(address.city)
      setLandmark(address.landmark || '')
      setIsDefault(address.isDefault)
      setCoords(address.coordinates || null)
    } else {
      setEditingAddress(null)
      setType('home')
      setName('')
      setAddress('')
      setCity('Kathmandu')
      setLandmark('')
      setIsDefault(false)
      setCoords(null)
    }
    setIsModalOpen(true)
    setError('')
    setSuccess('')
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingAddress(null)
    setError('')
    setSuccess('')
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setError('')
      },
      () => {
        setError('Failed to get your location.')
      }
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const url = editingAddress
        ? `/api/account/addresses/${editingAddress.id}`
        : '/api/account/addresses'
      
      const method = editingAddress ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          name,
          address,
          city,
          landmark: landmark || undefined,
          coordinates: coords || undefined,
          isDefault
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save address')
      }

      setSuccess(editingAddress ? 'Address updated successfully!' : 'Address added successfully!')
      await fetchAddresses()
      
      setTimeout(() => {
        closeModal()
        setSuccess('')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(addressId: string) {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const res = await fetch(`/api/account/addresses/${addressId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete address')

      setSuccess('Address deleted successfully!')
      await fetchAddresses()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address')
    }
  }

  if (loading) {
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-[#030e55]" />
          <h1 className="text-2xl font-bold tsf-font-sora">Addresses</h1>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 tsf-bg-blue text-white rounded-full px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          Add New Address
        </button>
      </div>

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

      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`border rounded-lg p-6 ${
                addr.isDefault ? 'border-[#030e55] bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{addr.name}</h3>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">
                    {addr.type}
                  </span>
                  {addr.isDefault && (
                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#030e55] text-white">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(addr)}
                    className="p-2 text-gray-600 hover:text-[#030e55] hover:bg-gray-100 rounded-md transition-colors"
                    title="Edit address"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{addr.address}</p>
                <p>{addr.city}</p>
                {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                {addr.coordinates && (
                  <a
                    href={`https://www.google.com/maps?q=${addr.coordinates.lat},${addr.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#030e55] hover:underline mt-2"
                  >
                    <Map className="h-4 w-4" />
                    View on Map
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900 mb-2">No addresses yet</p>
          <p className="text-gray-600 mb-6">Add your first address to get started.</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 tsf-bg-blue text-white rounded-full px-6 py-3 text-sm font-semibold hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            Add New Address
          </button>
        </div>
      )}

      {/* Add/Edit Address Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <Dialog.Title className="text-2xl font-bold tsf-font-sora mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Type <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
                      required
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
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
                    Address Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
                    placeholder="e.g., Home, Office"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
                      required
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#030e55] focus:border-transparent"
                    placeholder="House number, street name"
                    required
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={useMyLocation}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                    >
                      <Map className="h-4 w-4" />
                      Use My Location
                    </button>
                    {coords && (
                      <span className="text-sm text-gray-600">
                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded w-4 h-4 text-[#030e55] focus:ring-[#030e55] border-gray-300"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Set as default address
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 tsf-bg-blue text-white rounded-full px-6 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

