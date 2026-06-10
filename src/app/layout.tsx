import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Navigation } from '@/components/navigation'
import { ThemeProvider } from '@/components/theme-provider'
import { MainContent } from '@/components/main-content'
import { isClerkConfigured } from '@/lib/clerk-config'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bad Decision — Stop Buying Bad Leads',
  description: 'Buying bad leads is a bad decision. We search the live internet, find real businesses, and verify every email before you see it. No bounces. No dead numbers. No wasted money.',
}

function ClerkOptionalProvider({ children }: { children: React.ReactNode }) {
  // Only wrap with ClerkProvider if properly configured
  if (isClerkConfigured()) {
    return <ClerkProvider>{children}</ClerkProvider>
  }
  // No Clerk — render without it (app won't crash)
  return <>{children}</>
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkOptionalProvider>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var theme = localStorage.getItem('bd-theme');
                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                      document.documentElement.classList.add('dark');
                    }
                  } catch(e) {}
                })();
              `,
            }}
          />
        </head>
        <body className="font-sans antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen">
          <ThemeProvider>
            <Navigation />
            <MainContent>
              {children}
            </MainContent>
          </ThemeProvider>
        </body>
      </html>
    </ClerkOptionalProvider>
  )
}
