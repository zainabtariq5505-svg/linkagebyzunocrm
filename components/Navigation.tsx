'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Video, 
  BarChart3, 
  Settings,
  ChevronRight,
  LogOut,
  Clock,
  Zap
} from 'lucide-react'
import { clearAuthToken } from '@/lib/auth'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/creators', label: 'Creators', icon: Users },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/videos', label: 'Videos', icon: Video },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/automation', label: 'Automation', icon: Zap },
  { href: '/activity-logs', label: 'Activity Logs', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearAuthToken()
    router.push('/login')
  }

  return (
    <nav className="w-64 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <img src="/logo.svg" alt="Linkage Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">Linkage</h1>
        </div>
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
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-all"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
        <p className="text-xs text-gray-500 dark:text-slate-500">v2.0.0 Premium</p>
      </div>
    </nav>
  )
}
