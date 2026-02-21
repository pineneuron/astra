'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, FolderTree, Package, ShoppingCart, Settings, ChevronDown, Users, Bell, Wrench, Mail, PlusCircle, List, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as Collapsible from '@radix-ui/react-collapsible'

export default function SidebarNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Auto-open dropdown if current page is in that section
    if (pathname?.startsWith('/admin/categories')) {
      setOpenDropdown('categories')
    } else if (pathname?.startsWith('/admin/products')) {
      setOpenDropdown('products')
    } else if (pathname?.startsWith('/admin/pages')) {
      setOpenDropdown('pages')
    } else if (pathname?.startsWith('/admin/users')) {
      setOpenDropdown('users')
    } else if (pathname?.startsWith('/admin/settings')) {
      setOpenDropdown('settings')
    }
  }, [pathname])

  const handleDropdownToggle = (key: string) => {
    setOpenDropdown(prev => {
      // If clicking the same dropdown, close it
      if (prev === key) {
        return null
      }
      // Otherwise, open the clicked dropdown (closes others automatically)
      return key
    })
  }

  const isCategoriesActive = pathname?.startsWith('/admin/categories')
  const isProductsActive = pathname?.startsWith('/admin/products')
  const isPagesActive = pathname?.startsWith('/admin/pages')
  const isUsersActive = pathname?.startsWith('/admin/users')
  const isSettingsActive = pathname?.startsWith('/admin/settings')
  const currentSettingsTab = searchParams.get('tab')
  
  const getHash = () => {
    if (!mounted || typeof window === 'undefined') return ''
    return window.location.hash
  }

  return (
    <nav className="p-2 pt-0 space-y-0.5">
      <div className="px-3 py-2 text-xs font-medium text-gray-500 sidebar-label">Overview</div>
      <Link 
        href="/admin"
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
          pathname === '/admin' && "bg-gray-100 text-gray-900"
        )}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="sidebar-label">Dashboard</span>
      </Link>
      
      <Collapsible.Root open={openDropdown === 'categories'} onOpenChange={(open) => handleDropdownToggle(open ? 'categories' : '')}>
        <Collapsible.Trigger 
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
            isCategoriesActive && "bg-gray-100 text-gray-900"
          )}
        > 
          <span className="inline-flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            <span className="sidebar-label">Categories</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", openDropdown === 'categories' && "rotate-180")} />
        </Collapsible.Trigger>
        <Collapsible.Content className="pl-6 pr-2 py-1 space-y-1">
          <Link 
            href="/admin/categories#add"
            prefetch={false}
            scroll={false} 
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/categories' && getHash() === '#add' && "bg-gray-100"
            )}
          >
            <PlusCircle className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">Add New</span>
          </Link>
          <Link 
            href="/admin/categories"
            prefetch={false}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/categories' && getHash() !== '#add' && "bg-gray-100"
            )}
          >
            <List className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">All Categories</span>
          </Link>
        </Collapsible.Content>
      </Collapsible.Root>
      
      <Collapsible.Root open={openDropdown === 'products'} onOpenChange={(open) => handleDropdownToggle(open ? 'products' : '')}>
        <Collapsible.Trigger 
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
            isProductsActive && "bg-gray-100 text-gray-900"
          )}
        > 
          <span className="inline-flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="sidebar-label">Products</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", openDropdown === 'products' && "rotate-180")} />
        </Collapsible.Trigger>
        <Collapsible.Content className="pl-6 pr-2 py-1 space-y-1">
          <Link 
            href="/admin/products#add"
            prefetch={false}
            scroll={false} 
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/products' && getHash() === '#add' && "bg-gray-100"
            )}
          >
            <PlusCircle className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">Add New</span>
          </Link>
          <Link 
            href="/admin/products"
            prefetch={false}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/products' && getHash() !== '#add' && "bg-gray-100"
            )}
          >
            <List className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">All Products</span>
          </Link>
        </Collapsible.Content>
      </Collapsible.Root>
      
      <Collapsible.Root open={openDropdown === 'pages'} onOpenChange={(open) => handleDropdownToggle(open ? 'pages' : '')}>
        <Collapsible.Trigger 
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
            isPagesActive && "bg-gray-100 text-gray-900"
          )}
        > 
          <span className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="sidebar-label">Pages</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", openDropdown === 'pages' && "rotate-180")} />
        </Collapsible.Trigger>
        <Collapsible.Content className="pl-6 pr-2 py-1 space-y-1">
          <Link 
            href="/admin/pages#add"
            prefetch={false}
            scroll={false} 
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/pages' && getHash() === '#add' && "bg-gray-100"
            )}
          >
            <PlusCircle className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">Add New</span>
          </Link>
          <Link 
            href="/admin/pages"
            prefetch={false}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/pages' && getHash() !== '#add' && "bg-gray-100"
            )}
          >
            <List className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">All Pages</span>
          </Link>
        </Collapsible.Content>
      </Collapsible.Root>
      
      <Collapsible.Root open={openDropdown === 'users'} onOpenChange={(open) => handleDropdownToggle(open ? 'users' : '')}>
        <Collapsible.Trigger 
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
            isUsersActive && "bg-gray-100 text-gray-900"
          )}
        > 
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="sidebar-label">Users</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", openDropdown === 'users' && "rotate-180")} />
        </Collapsible.Trigger>
        <Collapsible.Content className="pl-6 pr-2 py-1 space-y-1">
          <Link 
            href="/admin/users#add"
            prefetch={false}
            scroll={false} 
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/users' && getHash() === '#add' && "bg-gray-100"
            )}
          >
            <PlusCircle className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">Add New</span>
          </Link>
          <Link 
            href="/admin/users"
            prefetch={false}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/users' && getHash() !== '#add' && "bg-gray-100"
            )}
          >
            <List className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">All Users</span>
          </Link>
        </Collapsible.Content>
      </Collapsible.Root>
      
      <Link 
        href="/admin/orders"
        prefetch={false}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
          pathname === '/admin/orders' && "bg-gray-100 text-gray-900"
        )}
      > 
        <ShoppingCart className="h-4 w-4" />
        <span className="sidebar-label">Orders</span>
      </Link>
      
      <Collapsible.Root open={openDropdown === 'settings'} onOpenChange={(open) => handleDropdownToggle(open ? 'settings' : '')}>
        <Collapsible.Trigger 
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
            isSettingsActive && "bg-gray-100 text-gray-900"
          )}
        > 
          <span className="inline-flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="sidebar-label">Settings</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", openDropdown === 'settings' && "rotate-180")} />
        </Collapsible.Trigger>
        <Collapsible.Content className="pl-6 pr-2 py-1 space-y-1">
          <Link 
            href="/admin/settings"
            prefetch={false}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/settings' && (!currentSettingsTab || currentSettingsTab === 'profile') && "bg-gray-100"
            )}
          >
            <Wrench className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">Profile</span>
          </Link>
          <Link 
            href="/admin/settings?tab=general"
            prefetch={false}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/settings' && currentSettingsTab === 'general' && "bg-gray-100"
            )}
          >
            <Settings className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">General</span>
          </Link>
          <Link 
            href="/admin/settings?tab=notifications"
            prefetch={false}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/settings' && currentSettingsTab === 'notifications' && "bg-gray-100"
            )}
          >
            <Bell className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">Notifications</span>
          </Link>
          <Link 
            href="/admin/settings?tab=smtp"
            prefetch={false}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
              pathname === '/admin/settings' && currentSettingsTab === 'smtp' && "bg-gray-100"
            )}
          >
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="sidebar-label">SMTP</span>
          </Link>
        </Collapsible.Content>
      </Collapsible.Root>
    </nav>
  )
}
