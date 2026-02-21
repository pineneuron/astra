'use client'

import { createContext, useContext } from 'react'
import type { GeneralSettings } from '@/lib/settings'

const GeneralSettingsContext = createContext<GeneralSettings | null>(null)

// Fallback settings used if a component accidentally calls useGeneralSettings
// outside of the GeneralSettingsProvider. This prevents hard runtime crashes.
const FALLBACK_GENERAL_SETTINGS: GeneralSettings = {
  siteTitle: '3 Star Foods',
  tagline: 'Three Star Foods website',
  siteIcon: '/images/favi-icon.svg',
  adminEmail: '',
  whatsappContactNumber: ''
}

type GeneralSettingsProviderProps = {
  value: GeneralSettings
  children: React.ReactNode
}

export function GeneralSettingsProvider({ value, children }: GeneralSettingsProviderProps) {
  return (
    <GeneralSettingsContext.Provider value={value}>
      {children}
    </GeneralSettingsContext.Provider>
  )
}

export function useGeneralSettings() {
  const context = useContext(GeneralSettingsContext)
  if (!context) {
    // Gracefully fall back instead of throwing to avoid breaking the app
    return FALLBACK_GENERAL_SETTINGS
  }
  return context
}
