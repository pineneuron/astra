import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getNotificationSettings, getSmtpSettings } from '@/lib/settings'

export const runtime = 'nodejs'

// Validation schema
interface ContactFormData {
    name: string
    email: string
    subject: string
    message: string
}

function validateContactForm(data: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data || typeof data !== 'object') {
        return { isValid: false, errors: ['Invalid form data'] }
    }

    const formData = data as Partial<ContactFormData>

    // Name validation
    if (!formData.name || typeof formData.name !== 'string' || formData.name.trim().length === 0) {
        errors.push('Name is required')
    } else if (formData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long')
    } else if (formData.name.trim().length > 100) {
        errors.push('Name must be less than 100 characters')
    }

    // Email validation
    if (!formData.email || typeof formData.email !== 'string' || formData.email.trim().length === 0) {
        errors.push('Email is required')
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email.trim())) {
            errors.push('Please enter a valid email address')
        }
    }

    // Subject validation
    if (!formData.subject || typeof formData.subject !== 'string' || formData.subject.trim().length === 0) {
        errors.push('Subject is required')
    } else if (formData.subject.trim().length < 3) {
        errors.push('Subject must be at least 3 characters long')
    } else if (formData.subject.trim().length > 200) {
        errors.push('Subject must be less than 200 characters')
    }

    // Message validation
    if (!formData.message || typeof formData.message !== 'string' || formData.message.trim().length === 0) {
        errors.push('Message is required')
    } else if (formData.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long')
    } else if (formData.message.trim().length > 5000) {
        errors.push('Message must be less than 5000 characters')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate form data
        const validation = validateContactForm(body)
        if (!validation.isValid) {
            return NextResponse.json(
                { error: 'Validation failed', errors: validation.errors },
                { status: 400 }
            )
        }

        const { name, email, subject, message } = body as ContactFormData

        // Sanitize inputs
        const sanitizedName = name.trim()
        const sanitizedEmail = email.trim().toLowerCase()
        const sanitizedSubject = subject.trim()
        const sanitizedMessage = message.trim()

        // Email configuration
        const smtpSettings = await getSmtpSettings()
        const fromEmail = smtpSettings.fromEmail || 'noreply@3starfoods.com'
        const fromName = smtpSettings.fromName || '3 Star Foods'
        const notificationSettings = await getNotificationSettings()
        const contactRecipients = notificationSettings.contactEmails.length
            ? notificationSettings.contactEmails
            : [process.env.ADMIN_EMAIL || 'admin@3starfoods.com']

        if (!smtpSettings.host || !smtpSettings.user || !smtpSettings.password) {
            console.warn('[CONTACT] SMTP settings incomplete. Unable to send email.');
            return NextResponse.json(
                { error: 'Email service not configured. Please contact support directly.' },
                { status: 500 }
            )
        }

        // Check if SMTP is configured
        const smtpPort = smtpSettings.port

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: smtpSettings.host,
            port: smtpPort,
            secure: smtpPort === 465,
            requireTLS: smtpPort === 587,
            auth: {
                user: smtpSettings.user,
                pass: smtpSettings.password,
            },
        })

        // Get base URL for logo
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const logoUrl = `${baseUrl}/images/logo.png`
        const companyName = fromName
        const companyAddress = process.env.COMPANY_ADDRESS || ''
        const companyPhone = process.env.COMPANY_PHONE || ''
        const companyEmail = fromEmail

        // Generate email HTML
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background-color:#ffffff;padding:30px 40px;text-align:center;border-bottom:3px solid #0073aa;">
              <img src="${logoUrl}" alt="${companyName}" style="max-width:200px;height:auto;display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:40px;">
              
              <!-- Title -->
              <h1 style="margin:0 0 10px;color:#2c3e50;font-size:24px;font-weight:600;line-height:1.3;">New Contact Form Submission</h1>
              
              <!-- Greeting -->
              <p style="margin:0 0 30px;color:#555;font-size:15px;line-height:1.6;">
                You have received a new contact form submission from your website.
              </p>

              <!-- Contact Details Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;background-color:#f8f9fa;border-radius:4px;overflow:hidden;">
                <tr>
                  <td style="padding:20px;">
                    <h2 style="margin:0 0 15px;color:#2c3e50;font-size:18px;font-weight:600;border-bottom:2px solid #0073aa;padding-bottom:10px;">Contact Details</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;width:30%;"><strong>Name:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;">${sanitizedName}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;width:30%;"><strong>Email:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;"><a href="mailto:${sanitizedEmail}" style="color:#0073aa;text-decoration:none;">${sanitizedEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;width:30%;"><strong>Subject:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;">${sanitizedSubject}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;width:30%;vertical-align:top;"><strong>Message:</strong></td>
                        <td style="padding:8px 0;color:#2c3e50;font-size:14px;white-space:pre-wrap;line-height:1.6;">${sanitizedMessage.replace(/\n/g, '<br>')}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Timestamp -->
              <p style="margin:20px 0 0;color:#999;font-size:12px;line-height:1.6;">
                Submitted on: ${new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#2c3e50;padding:30px 40px;text-align:center;">
              <p style="margin:0 0 10px;color:#ffffff;font-size:14px;font-weight:600;">${companyName}</p>
              ${companyAddress ? `<p style="margin:0 0 5px;color:#b0b0b0;font-size:12px;">${companyAddress}</p>` : ''}
              ${companyPhone ? `<p style="margin:0 0 5px;color:#b0b0b0;font-size:12px;">Phone: <a href="tel:${companyPhone}" style="color:#ffffff;text-decoration:none;">${companyPhone}</a></p>` : ''}
              <p style="margin:0 0 5px;color:#b0b0b0;font-size:12px;">Email: <a href="mailto:${companyEmail}" style="color:#ffffff;text-decoration:none;">${companyEmail}</a></p>
              <p style="margin:15px 0 0;color:#b0b0b0;font-size:11px;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

        const text = `New Contact Form Submission\n\nName: ${sanitizedName}\nEmail: ${sanitizedEmail}\nSubject: ${sanitizedSubject}\n\nMessage:\n${sanitizedMessage}\n\nSubmitted on: ${new Date().toLocaleString()}`

        // Send email to admin
        await transporter.sendMail({
            from: `"${companyName}" <${fromEmail}>`,
            to: contactRecipients,
            replyTo: sanitizedEmail,
            subject: `Contact Form: ${sanitizedSubject}`,
            text,
            html,
        })

        return NextResponse.json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you soon.'
        })
    } catch (error) {
        console.error('[CONTACT] Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: 'Failed to send message. Please try again later.', detail: errorMessage },
            { status: 500 }
        )
    }
}

