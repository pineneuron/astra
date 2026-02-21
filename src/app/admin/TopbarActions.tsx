'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Moon, Sun, User, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

type Props = {
  name?: string | null
  email?: string | null
}

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(' ')
    const a = parts[0]?.[0] || ''
    const b = parts[1]?.[0] || ''
    return (a + b).toUpperCase() || 'A'
  }
  const e = email || 'a@a.com'
  return e[0]?.toUpperCase() || 'A'
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('tsf-theme') : null
    const dark = saved ? saved === 'dark' : false
    setIsDark(dark)
    if (dark) document.documentElement.classList.add('dark')
  }, [])
  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tsf-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tsf-theme', 'light')
    }
  }
  return (
    <button onClick={toggle} aria-label="Toggle theme" className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-gray-100">
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export function AccountMenu({ name, email }: Props) {
  const initials = getInitials(name || undefined, email || undefined)

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-[#030e55] text-white">
          <span className="text-[12px] font-semibold">{initials}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="end" className="z-50 min-w-[240px] rounded-md bg-white p-2 shadow-md">
          <div className="px-2 pb-2">
            <div className="text-[14px] font-semibold text-gray-900">{name || 'Account'}</div>
            <div className="text-[12px] text-gray-500">{email || 'user@example.com'}</div>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-[oklch(.922_0_0)]" />
          <DropdownMenu.Item asChild>
            <Link
              href="/admin/settings?tab=profile"
              className="group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-gray-700 outline-none hover:bg-gray-100"
            >
              <User className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
              Settings
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-[oklch(.922_0_0)]" />
          <DropdownMenu.Item
            className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
