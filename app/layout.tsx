import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import ProtectedLayout from '@/components/ProtectedLayout'

export const metadata: Metadata = {
  title: 'Linkage CRM - Creator Management Platform',
  description: 'Premium Creator CRM for managing content, creators, and analytics. Built for professional content management.',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'Linkage CRM',
    description: 'Premium Creator Management Platform',
    images: ['/logo.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-white dark:bg-slate-950">
        <ProtectedLayout>
          <div className="flex h-screen">
            <Navigation />
            <main className="flex-1 overflow-auto">
              <div className="p-6 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </ProtectedLayout>
      </body>
    </html>
  )
}
