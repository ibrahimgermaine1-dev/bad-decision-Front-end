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
  description: 'Find real businesses that need your services. Every lead is verified before you pay — so you only reach real decision makers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
