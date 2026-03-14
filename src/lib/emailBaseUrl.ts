/**
 * Base URL for absolute links in emails (logo, reset links, etc).
 * Order: NEXT_PUBLIC_SITE_URL → NEXTAUTH_URL → Vercel deployment URL → localhost
 */
export function getEmailBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '')
  }
  // Vercel sets VERCEL_URL (e.g. "astra-xyz.vercel.app") on every deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}
