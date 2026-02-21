'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function format(segment: string): string {
  if (!segment) return ''
  return segment
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export default function Breadcrumb() {
  const pathname = usePathname() || '/admin'
  const parts = pathname.split('/').filter(Boolean)
  const adminIndex = parts.indexOf('admin')
  const trail = adminIndex >= 0 ? parts.slice(adminIndex) : parts

  const items = trail.map((seg, i) => {
    const href = '/' + trail.slice(0, i + 1).join('/')
    const isLast = i === trail.length - 1
    return { href, label: seg === 'admin' ? 'Dashboard' : format(seg), isLast }
  })

  return (
    <nav className="text-sm text-gray-500">
      {items.map((item, i) => (
        <span key={item.href}>
          {item.isLast ? (
            <span className="text-gray-700">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          )}
          {i < items.length - 1 && <span className="px-2">/</span>}
        </span>
      ))}
    </nav>
  )
}


