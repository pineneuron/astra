'use client'

import { useEffect, useState } from 'react'
import { PanelLeft, PanelRight } from 'lucide-react'

export default function SidebarToggle() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('adminSidebar') : null
    const isCollapsed = saved === 'collapsed'
    setCollapsed(isCollapsed)
    if (isCollapsed) document.documentElement.classList.add('admin-collapsed')
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    if (next) {
      document.documentElement.classList.add('admin-collapsed')
      localStorage.setItem('adminSidebar', 'collapsed')
    } else {
      document.documentElement.classList.remove('admin-collapsed')
      localStorage.setItem('adminSidebar', 'expanded')
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-50"
    >
      {collapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
    </button>
  )
}
