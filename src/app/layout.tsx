import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ClientProviders } from './client-providers'
import { ConditionalChrome } from '@/components/conditional-chrome'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bad Decision — Find Real Buyers. Skip The Ghost Towns.',
  description: 'We scan the live internet to find real businesses who want what you sell. Every email gets tested before you pay. No more dead lists. No more wasted money.',
  applicationName: 'Bad Decision',
  authors: [{ name: 'Bad Decision' }],
  keywords: ['lead generation', 'B2B leads', 'email verification', 'cold outreach', 'sales leads'],
}

// Mobile viewport — supports notched phones via viewport-fit=cover
// (needed for env(safe-area-inset-*) to work)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility, but prevent layout breakage
  viewportFit: 'cover',
  themeColor: '#00a8cc',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans antialiased">
        <ClientProviders>
          <ConditionalChrome>{children}</ConditionalChrome>
        </ClientProviders>
      </body>
    </html>
  )
}
