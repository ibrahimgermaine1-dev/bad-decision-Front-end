import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { CLERK_APPEARANCE } from '@/components/safe-clerk-auth'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bad Decision AI — Stop Emailing Ghost Towns',
  description: 'Our smart app finds real business contacts. It checks every email to make sure it works before you pay.',
}

export const dynamic = 'force-dynamic'

function ClerkGuard({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!pk || pk === 'pk_test_Y2xlcmsudGVzdC5jb20$') {
    // No valid Clerk key — render without Clerk (for build / local dev)
    return <>{children}</>
  }
  // Dynamic import to avoid Clerk crash when key is missing
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ClerkProvider } = require('@clerk/nextjs')
  return <ClerkProvider appearance={CLERK_APPEARANCE}>{children}</ClerkProvider>
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkGuard>
      <html lang="en" className={plusJakarta.variable}>
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkGuard>
  )
}
