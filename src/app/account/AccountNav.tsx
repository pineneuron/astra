'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User, 
  MapPin, 
  Lock,
  LogOut,
  PackageSearch
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/track-order', label: 'Track Order', icon: PackageSearch },
  { href: '/account/details', label: 'Account Details', icon: User },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/password', label: 'Change Password', icon: Lock },
]

export default function AccountNav() {
  const pathname = usePathname()

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold tsf-font-sora mb-6 text-gray-900">My Account</h2>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/account' && pathname?.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                isActive
                  ? "tsf-bg-blue text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </div>
  )
}
