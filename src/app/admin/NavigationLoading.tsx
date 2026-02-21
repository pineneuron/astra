'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationLoading() {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setIsNavigating(false)
    })
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement | null
      
      if (link && link.href) {
        try {
          const url = new URL(link.href, window.location.origin)
          // Only show loading for admin routes (not hash links)
          if (url.pathname.startsWith('/admin') && url.pathname !== pathname && !url.hash) {
            setIsNavigating(true)
          }
        } catch {
          // Invalid URL, ignore
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname])

  if (!isNavigating && !isPending) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50 pointer-events-none">
      <div className="h-full bg-[#030e55] animate-pulse" style={{ width: '100%' }} />
    </div>
  )
}
