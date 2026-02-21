import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import nodemailer from "nodemailer"
import crypto from "crypto"
import { getSmtpSettings } from "@/lib/settings"

export const runtime = 'nodejs'

// Generate a secure reset token
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: "If an account with that email exists, a password reset link has been sent." 
      })
    }

    // Check if user has a password (not OAuth-only account)
    if (!user.password) {
      return NextResponse.json({ 
        success: true, 
        message: "If an account with that email exists, a password reset link has been sent." 
      })
    }

    // Generate reset token
    const token = generateResetToken()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { 
        identifier: `reset:${normalizedEmail}`
      }
    })

    // Create new reset token
    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${normalizedEmail}`,
        token,
        expires,
      }
    })

    // Send email with reset link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`
    const logoUrl = `${baseUrl}/images/logo.png`
    const companyName = process.env.MAIL_FROM_NAME || '3 Star Foods'
    const companyEmail = process.env.MAIL_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@3starfoods.com'
    const companyAddress = process.env.COMPANY_ADDRESS || ''
    const companyPhone = process.env.COMPANY_PHONE || ''

    // Email template
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - ${companyName}</title>
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
              <h1 style="margin:0 0 10px;color:#2c3e50;font-size:24px;font-weight:600;line-height:1.3;">Reset Your Password</h1>
              
              <!-- Greeting -->
              <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
                We received a request to reset your password for your ${companyName} account. Click the button below to create a new password.
              </p>

              <!-- Reset Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background-color:#030e55;color:#ffffff;text-decoration:none;border-radius:4px;font-weight:600;font-size:16px;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin:20px 0 0;color:#999;font-size:13px;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color:#030e55;word-break:break-all;">${resetUrl}</a>
              </p>

              <!-- Security Notice -->
              <p style="margin:30px 0 0;color:#999;font-size:12px;line-height:1.6;">
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
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

    const text = `Reset Your Password - ${companyName}\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you didn't request a password reset, please ignore this email.`

    const smtpSettings = await getSmtpSettings()

    if (smtpSettings.host && smtpSettings.user && smtpSettings.password) {
      const transporter = nodemailer.createTransport({
        host: smtpSettings.host,
        port: smtpSettings.port,
        secure: smtpSettings.port === 465,
        requireTLS: smtpSettings.port === 587,
        auth: {
          user: smtpSettings.user,
          pass: smtpSettings.password,
        },
      })

      await transporter.sendMail({
        from: `"${companyName}" <${companyEmail}>`,
        to: normalizedEmail,
        subject: `Reset Your Password - ${companyName}`,
        text,
        html,
      })
    } else {
      // If SMTP not configured, log the reset link (for development)
      console.log(`[PASSWORD RESET] Email: ${normalizedEmail}, Reset URL: ${resetUrl}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: "If an account with that email exists, a password reset link has been sent." 
    })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    console.error('Forgot password error:', errorMessage)
    return NextResponse.json({ error: "Failed to process request", detail: errorMessage }, { status: 500 })
  }
}

