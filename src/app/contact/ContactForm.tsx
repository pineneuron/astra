"use client"

import { useState, FormEvent, ChangeEvent } from 'react'

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters long'
        if (value.trim().length > 100) return 'Name must be less than 100 characters'
        return ''
      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address'
        return ''
      case 'subject':
        if (!value.trim()) return 'Subject is required'
        if (value.trim().length < 3) return 'Subject must be at least 3 characters long'
        if (value.trim().length > 200) return 'Subject must be less than 200 characters'
        return ''
      case 'message':
        if (!value.trim()) return 'Message is required'
        if (value.trim().length < 10) return 'Message must be at least 10 characters long'
        if (value.trim().length > 5000) return 'Message must be less than 5000 characters'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof FormErrors]
        return newErrors
      })
    }

    // Clear submit status when user starts typing
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' })
    }
  }

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof FormErrors]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: FormErrors = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) {
        newErrors[key as keyof FormErrors] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSubmitStatus({ type: 'error', message: 'Please fix the errors in the form.' })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Success - reset form and show success message
      setFormData({ name: '', email: '', subject: '', message: '' })
      setErrors({})
      setSubmitStatus({
        type: 'success',
        message: data.message || 'Thank you for contacting us! We will get back to you soon.'
      })
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send message. Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {submitStatus.type && (
        <div className={`p-4 rounded-lg ${submitStatus.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          <p className="font-medium">{submitStatus.message}</p>
        </div>
      )}
      <form className="pt-8" onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
          <input
            className={`bg-white rounded-full w-full py-4 px-6 ${errors.name ? 'border-2 border-red-500' : ''}`}
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.name && <p className="text-red-500 text-sm mt-1 px-6">{errors.name}</p>}
        </div>
        <div className="mb-6">
          <input
            className={`bg-white rounded-full w-full py-4 px-6 ${errors.email ? 'border-2 border-red-500' : ''}`}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1 px-6">{errors.email}</p>}
        </div>
        <div className="mb-6">
          <input
            className={`bg-white rounded-full w-full py-4 px-6 ${errors.subject ? 'border-2 border-red-500' : ''}`}
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.subject && <p className="text-red-500 text-sm mt-1 px-6">{errors.subject}</p>}
        </div>
        <div className="mb-6">
          <textarea
            className={`bg-white rounded-lg w-full py-4 px-6 ${errors.message ? 'border-2 border-red-500' : ''}`}
            rows={10}
            name="message"
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.message && <p className="text-red-500 text-sm mt-1 px-6">{errors.message}</p>}
        </div>
        <button
          className="tsf-button cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Submit'}
        </button>
      </form>
    </>
  )
}

