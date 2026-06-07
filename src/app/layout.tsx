import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bad Decision AI — Stop Emailing Ghost Towns',
  description: 'Our smart app finds real business contacts. It checks every email to make sure it works before you pay.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ClerkProvider requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to be set.
  // During Vercel build, this env var WILL be available.
  // During local dev without env vars, we still render the page
  // but Clerk features won't work (users see the landing page).
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
