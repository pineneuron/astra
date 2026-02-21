import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'

export type GeneralSettings = {
  siteTitle: string
  tagline: string
  siteIcon: string
  adminEmail: string
  whatsappContactNumber: string
}

export type NotificationSettings = {
  orderEmails: string[]
  contactEmails: string[]
  orderWhatsAppNumbers: string[]
}

export type SmtpSettings = {
  host: string
  port: number
  user: string
  password: string
  fromEmail: string
  fromName: string
}

const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  siteTitle: '3 Star Foods',
  tagline: 'Three Star Foods website',
  siteIcon: '/images/favi-icon.svg',
  adminEmail: '',
  whatsappContactNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  orderEmails: [process.env.ADMIN_EMAIL || 'admin@3starfoods.com'],
  contactEmails: [process.env.CONTACT_FORM_EMAIL || process.env.ADMIN_EMAIL || 'info@3starfoods.com'],
  orderWhatsAppNumbers: []
}

const DEFAULT_SMTP_SETTINGS: SmtpSettings = {
  host: process.env.SMTP_HOST || '',
  port: process.env.SMTP_PORT ? Number.parseInt(process.env.SMTP_PORT, 10) || 587 : 587,
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASS || '',
  fromEmail: process.env.MAIL_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@3starfoods.com',
  fromName: process.env.MAIL_FROM_NAME || '3 Star Foods'
}

const GENERAL_SETTING_KEYS = {
  siteTitle: 'site_name',
  tagline: 'site_description',
  adminEmail: 'admin_email',
  whatsappContactNumber: 'whatsapp_contact_number'
} as const

const NOTIFICATION_SETTING_KEYS = {
  orderEmails: 'notifications_order_emails',
  contactEmails: 'notifications_contact_emails',
  orderWhatsAppNumbers: 'notifications_order_whatsapp_numbers'
} as const

const SMTP_SETTING_KEYS = {
  host: 'smtp_host',
  port: 'smtp_port',
  user: 'smtp_user',
  password: 'smtp_pass',
  fromEmail: 'smtp_from_email',
  fromName: 'smtp_from_name'
} as const

function parseEmailList(value?: string | null) {
  if (!value) return []
  const emails = value
    .split(',')
    .map(email => email.trim())
    .filter(Boolean)

  return Array.from(new Set(emails))
}

function serializeEmailList(emails: string[]) {
  return emails.join(',')
}

async function queryGeneralSettings(): Promise<GeneralSettings> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: Object.values(GENERAL_SETTING_KEYS)
        }
      }
    })

    if (!settings.length) {
      return DEFAULT_GENERAL_SETTINGS
    }

    const map = settings.reduce<Record<string, string>>((acc, setting) => {
      if (setting.value) {
        acc[setting.key] = setting.value
      }
      return acc
    }, {})

    return {
      siteTitle: map[GENERAL_SETTING_KEYS.siteTitle] ?? DEFAULT_GENERAL_SETTINGS.siteTitle,
      tagline: map[GENERAL_SETTING_KEYS.tagline] ?? DEFAULT_GENERAL_SETTINGS.tagline,
      siteIcon: DEFAULT_GENERAL_SETTINGS.siteIcon,
      adminEmail: map[GENERAL_SETTING_KEYS.adminEmail] ?? DEFAULT_GENERAL_SETTINGS.adminEmail,
      whatsappContactNumber: map[GENERAL_SETTING_KEYS.whatsappContactNumber] ?? DEFAULT_GENERAL_SETTINGS.whatsappContactNumber
    }
  } catch (error) {
    // During build time, database might not be available
    // Return defaults to allow build to complete
    console.warn('[Settings] Database not available, using defaults:', error instanceof Error ? error.message : 'Unknown error')
    return DEFAULT_GENERAL_SETTINGS
  }
}

export const getGeneralSettings = unstable_cache(queryGeneralSettings, ['general-settings'], {
  revalidate: false,
  tags: ['general-settings']
})

async function queryNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: Object.values(NOTIFICATION_SETTING_KEYS)
        }
      }
    })

    if (!settings.length) {
      return DEFAULT_NOTIFICATION_SETTINGS
    }

    const map = settings.reduce<Record<string, string>>((acc, setting) => {
      if (setting.value) {
        acc[setting.key] = setting.value
      }
      return acc
    }, {})

    const orderEmails = parseEmailList(map[NOTIFICATION_SETTING_KEYS.orderEmails])
    const contactEmails = parseEmailList(map[NOTIFICATION_SETTING_KEYS.contactEmails])
    const orderWhatsAppNumbers = parseEmailList(map[NOTIFICATION_SETTING_KEYS.orderWhatsAppNumbers])

    return {
      orderEmails: orderEmails.length ? orderEmails : DEFAULT_NOTIFICATION_SETTINGS.orderEmails,
      contactEmails: contactEmails.length ? contactEmails : DEFAULT_NOTIFICATION_SETTINGS.contactEmails,
      orderWhatsAppNumbers: orderWhatsAppNumbers.length ? orderWhatsAppNumbers : DEFAULT_NOTIFICATION_SETTINGS.orderWhatsAppNumbers
    }
  } catch (error) {
    // During build time, database might not be available
    console.warn('[Settings] Database not available, using defaults:', error instanceof Error ? error.message : 'Unknown error')
    return DEFAULT_NOTIFICATION_SETTINGS
  }
}

export const getNotificationSettings = unstable_cache(queryNotificationSettings, ['notification-settings'], {
  revalidate: false,
  tags: ['notification-settings']
})

export const notificationSettingUtils = {
  serializeEmailList,
  parseEmailList,
  keys: NOTIFICATION_SETTING_KEYS
}

async function querySmtpSettings(): Promise<SmtpSettings> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: Object.values(SMTP_SETTING_KEYS)
        }
      }
    })

    if (!settings.length) {
      return DEFAULT_SMTP_SETTINGS
    }

    const map = settings.reduce<Record<string, string>>((acc, setting) => {
      if (setting.value !== null && setting.value !== undefined) {
        acc[setting.key] = setting.value
      }
      return acc
    }, {})

    const parsedPort = map[SMTP_SETTING_KEYS.port]
      ? Number.parseInt(map[SMTP_SETTING_KEYS.port], 10)
      : undefined

    return {
      host: map[SMTP_SETTING_KEYS.host] ?? DEFAULT_SMTP_SETTINGS.host,
      port: parsedPort && !Number.isNaN(parsedPort) ? parsedPort : DEFAULT_SMTP_SETTINGS.port,
      user: map[SMTP_SETTING_KEYS.user] ?? DEFAULT_SMTP_SETTINGS.user,
      password: map[SMTP_SETTING_KEYS.password] ?? DEFAULT_SMTP_SETTINGS.password,
      fromEmail: map[SMTP_SETTING_KEYS.fromEmail] ?? DEFAULT_SMTP_SETTINGS.fromEmail,
      fromName: map[SMTP_SETTING_KEYS.fromName] ?? DEFAULT_SMTP_SETTINGS.fromName
    }
  } catch (error) {
    // During build time, database might not be available
    console.warn('[Settings] Database not available, using defaults:', error instanceof Error ? error.message : 'Unknown error')
    return DEFAULT_SMTP_SETTINGS
  }
}

export const getSmtpSettings = unstable_cache(querySmtpSettings, ['smtp-settings'], {
  revalidate: false,
  tags: ['smtp-settings']
})

export const smtpSettingUtils = {
  keys: SMTP_SETTING_KEYS
}

export type WhatsAppSettings = {
  accessToken: string
  phoneNumberId: string
  businessAccountId?: string
}

const WHATSAPP_SETTING_KEYS = {
  accessToken: 'whatsapp_access_token',
  phoneNumberId: 'whatsapp_phone_number_id',
  businessAccountId: 'whatsapp_business_account_id'
} as const

const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ''
}

async function queryWhatsAppSettings(): Promise<WhatsAppSettings> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: Object.values(WHATSAPP_SETTING_KEYS)
        }
      }
    })

    if (!settings.length) {
      return DEFAULT_WHATSAPP_SETTINGS
    }

    const map = settings.reduce<Record<string, string>>((acc, setting) => {
      if (setting.value !== null && setting.value !== undefined) {
        acc[setting.key] = setting.value
      }
      return acc
    }, {})

    return {
      accessToken: map[WHATSAPP_SETTING_KEYS.accessToken] ?? DEFAULT_WHATSAPP_SETTINGS.accessToken,
      phoneNumberId: map[WHATSAPP_SETTING_KEYS.phoneNumberId] ?? DEFAULT_WHATSAPP_SETTINGS.phoneNumberId,
      businessAccountId: map[WHATSAPP_SETTING_KEYS.businessAccountId] ?? DEFAULT_WHATSAPP_SETTINGS.businessAccountId
    }
  } catch (error) {
    console.warn('[Settings] Database not available, using defaults:', error instanceof Error ? error.message : 'Unknown error')
    return DEFAULT_WHATSAPP_SETTINGS
  }
}

export const getWhatsAppSettings = unstable_cache(queryWhatsAppSettings, ['whatsapp-settings'], {
  revalidate: false,
  tags: ['whatsapp-settings']
})

export const whatsappSettingUtils = {
  keys: WHATSAPP_SETTING_KEYS
}
