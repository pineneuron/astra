import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import type { NextAuthOptions, DefaultSession } from "next-auth"
import { getSmtpSettings } from "@/lib/settings"

declare module "next-auth" {
  interface Session {
    userId?: string
    user: {
      role?: string
    } & DefaultSession["user"]
  }
  interface JWT {
    role?: string
  }
}

export const runtime = 'nodejs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[AUTH] Missing credentials')
            return null
          }
          
          // Normalize email to lowercase for lookup
          const email = credentials.email.toLowerCase().trim()
          console.log('[AUTH] Attempting login for:', email)
          
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) {
            console.log('[AUTH] User not found:', email)
            return null
          }
          
          if (!user.password) {
            console.log('[AUTH] User has no password set:', email)
            return null
          }
          
          const valid = await bcrypt.compare(credentials.password, user.password)
          if (!valid) {
            console.log('[AUTH] Invalid password for:', email)
            return null
          }
          
          console.log('[AUTH] Login successful for:', email, 'Role:', user.role)
          return {
            id: user.id,
            email: user.email || undefined,
            name: user.name || undefined,
            role: user.role,
          }
        } catch (error) {
          console.error('[AUTH] Authorize error:', error)
          return null
        }
      },
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url }) {
        // Get base URL for logo
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const logoUrl = `${baseUrl}/images/logo.png`;
        const smtpSettings = await getSmtpSettings();
        const companyName = smtpSettings.fromName || process.env.MAIL_FROM_NAME || '3 Star Foods';
        const companyEmail = smtpSettings.fromEmail || process.env.MAIL_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@3starfoods.com';
        const companyAddress = process.env.COMPANY_ADDRESS || '';
        const companyPhone = process.env.COMPANY_PHONE || '';

        // Generate email template with header and footer matching order emails
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${companyName}</title>
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
              <h1 style="margin:0 0 10px;color:#2c3e50;font-size:24px;font-weight:600;line-height:1.3;">Sign in to ${companyName}</h1>
              
              <!-- Greeting -->
              <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
                Click the button below to sign in to your account. This link will expire in 24 hours.
              </p>

              <!-- Sign In Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${url}" style="display:inline-block;padding:14px 32px;background-color:#030e55;color:#ffffff;text-decoration:none;border-radius:4px;font-weight:600;font-size:16px;text-align:center;">Sign in</a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin:20px 0 0;color:#555;font-size:14px;line-height:1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:10px 0 30px;color:#0073aa;font-size:13px;word-break:break-all;line-height:1.6;">
                <a href="${url}" style="color:#0073aa;text-decoration:underline;">${url}</a>
              </p>

              <!-- Security Notice -->
              <p style="margin:30px 0 0;color:#999;font-size:12px;line-height:1.6;">
                If you didn't request this sign-in link, you can safely ignore this email. No one can sign in to your account without access to this email.
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

        const text = `Sign in to ${companyName}\n\nClick the link below to sign in to your account:\n${url}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this sign-in link, you can safely ignore this email.`;

        // Send email using nodemailer if configured, otherwise use NextAuth's default
        if (smtpSettings.host && smtpSettings.user && smtpSettings.password) {
          // Dynamic import to avoid requiring types at build time
          const nodemailerModule = await import('nodemailer');
          const transporter = nodemailerModule.default.createTransport({
            host: smtpSettings.host,
            port: smtpSettings.port,
            secure: smtpSettings.port === 465, // true for 465 (SSL), false for other ports
            requireTLS: smtpSettings.port === 587, // require TLS for port 587
            auth: {
              user: smtpSettings.user,
              pass: smtpSettings.password,
            },
          });

          await transporter.sendMail({
            from: `"${companyName}" <${companyEmail}>`,
            to: email,
            subject: `Sign in to ${companyName}`,
            text,
            html,
          });
          return;
        }

        // Fallback: if SMTP is not configured, NextAuth will handle email sending
        // This should not happen in production, but provides a fallback
        throw new Error('Email configuration is missing. Please configure SMTP settings.');
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.userId = token.sub
        session.user.role = token.role as string | undefined
        if (token.name) {
          session.user.name = token.name
        }
        if (token.picture) {
          session.user.image = token.picture
        }
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session?.user) {
        if (session.user.name) {
          token.name = session.user.name
        }
        if (session.user.image) {
          token.picture = session.user.image
        }
      }

      // On first sign in (user object is available), fetch user role from database
      if (user && user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { role: true }
          })
          if (dbUser) {
            token.role = dbUser.role
          } else {
            // New OAuth user - default to CUSTOMER role
            token.role = 'CUSTOMER'
          }
        } catch (error) {
          console.error('[AUTH] Error fetching user role:', error)
          token.role = 'CUSTOMER' // Default fallback
        }
      }
      
      // If user already has role in token, keep it
      if (user && 'role' in user && user.role) {
        token.role = user.role as string
      }

      if (user?.name) {
        token.name = user.name
      }

      if (user && 'image' in user && typeof user.image === 'string' && user.image) {
        token.picture = user.image
      }
      
      return token
    },
    async redirect({ url, baseUrl }) {
      // If redirecting to admin, allow it
      if (url.startsWith('/admin')) {
        return url.startsWith(baseUrl) ? url : `${baseUrl}${url}`
      }
      
      // Otherwise use default behavior
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
    newUser: "/account",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
