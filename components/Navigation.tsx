'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Video, 
  BarChart3, 
  Settings,
  ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/creators', label: 'Creators', icon: Users },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/videos', label: 'Videos', icon: Video },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="w-64 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Linkage</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Creator CRM</p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {isActive && <ChevronRight size={16} className="ml-auto" />}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <p className="text-xs text-gray-500 dark:text-slate-500">v1.0.0</p>
      </div>
    </nav>
  )
}
