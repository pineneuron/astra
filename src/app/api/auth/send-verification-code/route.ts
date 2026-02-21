import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import nodemailer from "nodemailer"
import { getSmtpSettings } from "@/lib/settings"

export const runtime = 'nodejs'

// Generate a 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Generate verification code
    const code = generateCode()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing verification token for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail }
    })

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: code,
        expires,
      }
    })

    // Send email with verification code
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const logoUrl = `${baseUrl}/images/logo.png`;
    const companyName = process.env.MAIL_FROM_NAME || '3 Star Foods';
    const companyEmail = process.env.MAIL_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@3starfoods.com';
    const companyAddress = process.env.COMPANY_ADDRESS || '';
    const companyPhone = process.env.COMPANY_PHONE || '';

    // Email template matching order emails
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - ${companyName}</title>
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
              <h1 style="margin:0 0 10px;color:#2c3e50;font-size:24px;font-weight:600;line-height:1.3;">Verify Your Email</h1>
              
              <!-- Greeting -->
              <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
                Thank you for registering with ${companyName}. Please use the verification code below to complete your registration.
              </p>

              <!-- Verification Code -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;background-color:#f8f9fa;border-radius:8px;padding:30px;text-align:center;">
                <tr>
                  <td>
                    <p style="margin:0 0 15px;color:#555;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
                    <div style="font-size:36px;font-weight:700;color:#030e55;letter-spacing:8px;font-family:'Courier New',monospace;">${code}</div>
                    <p style="margin:15px 0 0;color:#999;font-size:12px;">This code will expire in 10 minutes</p>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <p style="margin:30px 0 0;color:#999;font-size:12px;line-height:1.6;">
                If you didn't request this verification code, you can safely ignore this email.
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
    `;

    const text = `Verify Your Email - ${companyName}\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this verification code, you can safely ignore this email.`;

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
      });

      await transporter.sendMail({
        from: `"${companyName}" <${companyEmail}>`,
        to: normalizedEmail,
        subject: `Verify Your Email - ${companyName}`,
        text,
        html,
      });
    } else {
      // If SMTP not configured, log the code (for development)
      console.log(`[VERIFICATION CODE] Email: ${normalizedEmail}, Code: ${code}`);
    }

    return NextResponse.json({ success: true, message: "Verification code sent to your email" })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    console.error('Send verification code error:', errorMessage)
    return NextResponse.json({ error: "Failed to send verification code", detail: errorMessage }, { status: 500 })
  }
}
