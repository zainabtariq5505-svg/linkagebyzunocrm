'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = isAuthenticated()
    setIsAuth(authenticated)
    setIsLoading(false)

    // Redirect to login if not authenticated and not on login page
    if (!authenticated && pathname !== '/login') {
      router.replace('/login')
    }
  }, [pathname, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-purple-400 rounded-full"></div>
        </div>
      </div>
    )
  }

  // Render login page without the main layout
  if (pathname === '/login') {
    return children
  }

  // Render protected routes
  if (isAuth) {
    return children
  }

  // Fallback - should not reach here
  return null
}
