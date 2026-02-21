'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { ValidationUtils } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { getGeneralSettings as fetchGeneralSettings, getNotificationSettings as fetchNotificationSettings, getSmtpSettings as fetchSmtpSettings, getWhatsAppSettings as fetchWhatsAppSettings, notificationSettingUtils, smtpSettingUtils, whatsappSettingUtils } from '@/lib/settings'

async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    redirect('/auth/login')
  }
  return session
}

type ProfilePayload = {
  name?: string | null
  imageUrl?: string | null
}

type PasswordPayload = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type GeneralSettingsPayload = {
  siteTitle: string
  tagline?: string | null
  adminEmail: string
  whatsappContactNumber?: string
}

type NotificationSettingsPayload = {
  orderEmails: string[]
  contactEmails: string[]
  orderWhatsAppNumbers: string[]
}

type WhatsAppSettingsPayload = {
  accessToken: string
  phoneNumberId: string
  businessAccountId?: string
}

type SmtpSettingsPayload = {
  host: string
  port: number
  user: string
  password?: string | null
  fromEmail: string
  fromName: string
}

export async function updateProfile({ name, imageUrl }: ProfilePayload) {
  const session = await requireAuth()
  const userId = session.userId

  if (!userId) {
    return { ok: false, error: 'User not found' }
  }

  const trimmedName = name?.trim() ?? ''
  const trimmedImageUrl = imageUrl?.trim() || null

  if (!trimmedName) {
    return { ok: false, error: 'Name is required' }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: trimmedName || null,
        image: trimmedImageUrl,
      },
    })

    revalidatePath('/admin/settings')
    return { ok: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { ok: false, error: 'Failed to update profile' }
  }
}

export async function updatePassword({ currentPassword, newPassword, confirmPassword }: PasswordPayload) {
  const session = await requireAuth()
  const userId = session.userId

  if (!userId) {
    return { ok: false, error: 'User not found' }
  }

  const trimmedCurrent = currentPassword.trim()
  const trimmedNew = newPassword.trim()
  const trimmedConfirm = confirmPassword.trim()

  if (!trimmedCurrent || !trimmedNew || !trimmedConfirm) {
    return { ok: false, error: 'All password fields are required' }
  }

  if (trimmedNew !== trimmedConfirm) {
    return { ok: false, error: 'New passwords do not match' }
  }

  if (trimmedNew.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user?.password) {
      return { ok: false, error: 'User not found' }
    }

    const isValidPassword = await bcrypt.compare(trimmedCurrent, user.password)
    if (!isValidPassword) {
      return { ok: false, error: 'Current password is incorrect' }
    }

    const hashedPassword = await bcrypt.hash(trimmedNew, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    revalidatePath('/admin/settings')
    return { ok: true }
  } catch (error) {
    console.error('Error updating password:', error)
    return { ok: false, error: 'Failed to update password' }
  }
}

export async function getGeneralSettings() {
  const session = await requireAuth()
  if (session.user?.role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized' }
  }

  const settings = await fetchGeneralSettings()

  return {
    ok: true,
    data: {
      ...settings,
      adminEmail: settings.adminEmail || session.user.email || ''
    }
  }
}

export async function getNotificationSettings() {
  const session = await requireAuth()
  if (session.user?.role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized' }
  }

  const settings = await fetchNotificationSettings()

  return {
    ok: true,
    data: settings
  }
}

export async function getSmtpSettings() {
  const session = await requireAuth()
  if (session.user?.role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized' }
  }

  const settings = await fetchSmtpSettings()

  return {
    ok: true,
    data: {
      host: settings.host,
      port: settings.port,
      user: settings.user,
      fromEmail: settings.fromEmail,
      fromName: settings.fromName,
      hasPassword: Boolean(settings.password)
    }
  }
}

export async function getWhatsAppSettings() {
  const session = await requireAuth()
  if (session.user?.role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized' }
  }

  try {
    const settings = await fetchWhatsAppSettings()
    return { ok: true, data: settings }
  } catch (error) {
    console.error('Error fetching WhatsApp settings:', error)
    return { ok: false, error: 'Failed to fetch WhatsApp settings' }
  }
}

export async function updateGeneralSettings({ siteTitle, tagline, adminEmail, whatsappContactNumber }: GeneralSettingsPayload) {
  const session = await requireAuth()
  if (session.user?.role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized' }
  }

  const trimmedTitle = siteTitle.trim()
  const trimmedTagline = tagline?.trim() ?? ''
  const trimmedEmail = adminEmail.trim()
  const trimmedWhatsAppNumber = whatsappContactNumber?.trim() ?? ''

  if (!trimmedTitle) {
    return { ok: false, error: 'Site title is required' }
  }

  if (!ValidationUtils.isValidEmail(trimmedEmail)) {
    return { ok: false, error: 'Please provide a valid administration email address' }
  }

  try {
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: 'site_name' },
        update: { value: trimmedTitle, type: 'string', category: 'general' },
        create: { key: 'site_name', value: trimmedTitle, type: 'string', category: 'general' }
      }),
      prisma.systemSetting.upsert({
        where: { key: 'site_description' },
        update: { value: trimmedTagline, type: 'string', category: 'general' },
        create: { key: 'site_description', value: trimmedTagline, type: 'string', category: 'general' }
      }),
      prisma.systemSetting.upsert({
        where: { key: 'admin_email' },
        update: { value: trimmedEmail, type: 'string', category: 'general' },
        create: { key: 'admin_email', value: trimmedEmail, type: 'string', category: 'general' }
      }),
      prisma.systemSetting.upsert({
        where: { key: 'whatsapp_contact_number' },
        update: { value: trimmedWhatsAppNumber, type: 'string', category: 'general' },
        create: { key: 'whatsapp_contact_number', value: trimmedWhatsAppNumber, type: 'string', category: 'general' }
      })
    ])

    revalidatePath('/admin/settings')
    revalidatePath('/', 'layout')
    revalidateTag('general-settings')
    return { ok: true }
  } catch (error) {
    console.error('Error updating general settings:', error)
    return { ok: false, error: 'Failed to update general settings' }
  }
}

export async function updateNotificationSettings(payload: NotificationSettingsPayload) {
  const session = await requireAuth()
  if (session.user?.role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized' }
  }

  const orderEmails = Array.from(new Set(payload.orderEmails.map(email => email.trim()))).filter(Boolean)
  const contactEmails = Array.from(new Set(payload.contactEmails.map(email => email.trim()))).filter(Boolean)
  const orderWhatsAppNumbers = Array.from(new Set(payload.orderWhatsAppNumbers.map(num => num.trim()))).filter(Boolean)

  if (!orderEmails.length) {
    return { ok: false, error: 'At least one order notification email is required' }
  }

  if (!orderEmails.every(ValidationUtils.isValidEmail)) {
    return { ok: false, error: 'One or more order notification emails are invalid' }
  }

  if (!contactEmails.length) {
    return { ok: false, error: 'At least one contact form email is required' }
  }

  if (!contactEmails.every(ValidationUtils.isValidEmail)) {
    return { ok: false, error: 'One or more contact form emails are invalid' }
  }

  try {
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: notificationSettingUtils.keys.orderEmails },
        update: {
          value: notificationSettingUtils.serializeEmailList(orderEmails),
          type: 'string',
          category: 'notifications'
        },
        create: {
          key: notificationSettingUtils.keys.orderEmails,
          value: notificationSettingUtils.serializeEmailList(orderEmails),
          type: 'string',
          category: 'notifications'
        }
      }),
      prisma.systemSetting.upsert({
        where: { key: notificationSettingUtils.keys.contactEmails },
        update: {
          value: notificationSettingUtils.serializeEmailList(contactEmails),
          type: 'string',
          category: 'notifications'
        },
        create: {
          key: notificationSettingUtils.keys.contactEmails,
          value: notificationSettingUtils.serializeEmailList(contactEmails),
          type: 'string',
          category: 'notifications'
        }
      }),
      prisma.systemSetting.upsert({
        where: { key: notificationSettingUtils.keys.orderWhatsAppNumbers },
        update: {
          value: notificationSettingUtils.serializeEmailList(orderWhatsAppNumbers),
          type: 'string',
          category: 'notifications'
        },
        create: {
          key: notificationSettingUtils.keys.orderWhatsAppNumbers,
          value: notificationSettingUtils.serializeEmailList(orderWhatsAppNumbers),
          type: 'string',
          category: 'notifications'
        }
      })
    ])

    revalidatePath('/admin/settings')
    revalidateTag('notification-settings')

    return { ok: true }
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return { ok: false, error: 'Failed to update notification settings' }
  }
}

export async function updateWhatsAppSettings(payload: WhatsAppSettingsPayload) {
  const session = await requireAuth()
  if (session.user?.role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized' }
  }

  const accessToken = payload.accessToken.trim()
  const phoneNumberId = payload.phoneNumberId.trim()
  const businessAccountId = payload.businessAccountId?.trim() || ''

  if (!accessToken) {
    return { ok: false, error: 'WhatsApp Access Token is required' }
  }

  if (!phoneNumberId) {
    return { ok: false, error: 'WhatsApp Phone Number ID is required' }
  }

  try {
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: whatsappSettingUtils.keys.accessToken },
        update: {
          value: accessToken,
          type: 'string',
          category: 'whatsapp'
        },
        create: {
          key: whatsappSettingUtils.keys.accessToken,
          value: accessToken,
          type: 'string',
          category: 'whatsapp'
        }
      }),
      prisma.systemSetting.upsert({
        where: { key: whatsappSettingUtils.keys.phoneNumberId },
        update: {
          value: phoneNumberId,
          type: 'string',
          category: 'whatsapp'
        },
        create: {
          key: whatsappSettingUtils.keys.phoneNumberId,
          value: phoneNumberId,
          type: 'string',
          category: 'whatsapp'
        }
      }),
      ...(businessAccountId ? [
        prisma.systemSetting.upsert({
          where: { key: whatsappSettingUtils.keys.businessAccountId },
          update: {
            value: businessAccountId,
            type: 'string',
            category: 'whatsapp'
          },
          create: {
            key: whatsappSettingUtils.keys.businessAccountId,
            value: businessAccountId,
            type: 'string',
            category: 'whatsapp'
          }
        })
      ] : [])
    ])

    revalidatePath('/admin/settings')
    revalidateTag('whatsapp-settings')

    return { ok: true }
  } catch (error) {
    console.error('Error updating WhatsApp settings:', error)
    return { ok: false, error: 'Failed to update WhatsApp settings' }
  }
}

export async function updateSmtpSettings({ host, port, user, password, fromEmail, fromName }: SmtpSettingsPayload) {
  const session = await requireAuth()
  if (session.user?.role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized' }
  }

  const trimmedHost = host.trim()
  const trimmedUser = user.trim()
  const trimmedFromEmail = fromEmail.trim()
  const trimmedFromName = fromName.trim()
  const portNumber = Number(port)
  const newPassword = password?.trim() ?? ''
  const shouldUpdatePassword = newPassword.length > 0

  if (!trimmedHost) {
    return { ok: false, error: 'SMTP host is required' }
  }

  if (!Number.isInteger(portNumber) || portNumber <= 0) {
    return { ok: false, error: 'SMTP port must be a positive whole number' }
  }

  if (!trimmedUser) {
    return { ok: false, error: 'SMTP username is required' }
  }

  if (!ValidationUtils.isValidEmail(trimmedFromEmail)) {
    return { ok: false, error: 'Please provide a valid from email address' }
  }

  const currentSettings = await fetchSmtpSettings()

  if (!shouldUpdatePassword && !currentSettings.password) {
    return { ok: false, error: 'SMTP password is required' }
  }

  try {
    const operations = [
      prisma.systemSetting.upsert({
        where: { key: smtpSettingUtils.keys.host },
        update: { value: trimmedHost, type: 'string', category: 'smtp' },
        create: { key: smtpSettingUtils.keys.host, value: trimmedHost, type: 'string', category: 'smtp' }
      }),
      prisma.systemSetting.upsert({
        where: { key: smtpSettingUtils.keys.port },
        update: { value: String(portNumber), type: 'number', category: 'smtp' },
        create: { key: smtpSettingUtils.keys.port, value: String(portNumber), type: 'number', category: 'smtp' }
      }),
      prisma.systemSetting.upsert({
        where: { key: smtpSettingUtils.keys.user },
        update: { value: trimmedUser, type: 'string', category: 'smtp' },
        create: { key: smtpSettingUtils.keys.user, value: trimmedUser, type: 'string', category: 'smtp' }
      }),
      prisma.systemSetting.upsert({
        where: { key: smtpSettingUtils.keys.fromEmail },
        update: { value: trimmedFromEmail, type: 'string', category: 'smtp' },
        create: { key: smtpSettingUtils.keys.fromEmail, value: trimmedFromEmail, type: 'string', category: 'smtp' }
      }),
      prisma.systemSetting.upsert({
        where: { key: smtpSettingUtils.keys.fromName },
        update: { value: trimmedFromName, type: 'string', category: 'smtp' },
        create: { key: smtpSettingUtils.keys.fromName, value: trimmedFromName, type: 'string', category: 'smtp' }
      })
    ]

    if (shouldUpdatePassword) {
      operations.push(
        prisma.systemSetting.upsert({
          where: { key: smtpSettingUtils.keys.password },
          update: { value: newPassword, type: 'string', category: 'smtp' },
          create: { key: smtpSettingUtils.keys.password, value: newPassword, type: 'string', category: 'smtp' }
        })
      )
    }

    await prisma.$transaction(operations)

    revalidatePath('/admin/settings')
    revalidateTag('smtp-settings')

    return { ok: true }
  } catch (error) {
    console.error('Error updating SMTP settings:', error)
    return { ok: false, error: 'Failed to update SMTP settings' }
  }
}
