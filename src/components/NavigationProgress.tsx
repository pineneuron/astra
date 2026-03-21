'use client'

import { useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, trickleSpeed: 200, minimum: 0.08 })

export default function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const start = useCallback(() => NProgress.start(), [])
  const done = useCallback(() => NProgress.done(), [])

  // Complete bar on route change
  useEffect(() => {
    done()
  }, [pathname, searchParams, done])

  // Start bar on any anchor click that triggers navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href) return
      // Only internal navigation, not hash-only or external links
      if (href.startsWith('/') && !href.startsWith('//')) {
        start()
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [start])

  return (
    <style>{`
      #nprogress {
        pointer-events: none;
      }
      #nprogress .bar {
        background: linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9));
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
      }
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px rgba(243,115,53,0.7), 0 0 5px rgba(243,115,53,0.7);
        opacity: 1.0;
        transform: rotate(3deg) translate(0px, -4px);
      }
    `}</style>
  )
}
