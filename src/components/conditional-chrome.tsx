'use client'

/**
 * ConditionalChrome — Shows Navbar + Footer on marketing pages,
 * hides them on dashboard routes (which have their own layout).
 */
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const HIDDEN_ROUTES = ['/dashboard', '/sign-in', '/sign-up', '/sso-callback']

export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const shouldHide = HIDDEN_ROUTES.some(route => pathname?.startsWith(route))

  if (shouldHide) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 sm:pt-18">{children}</main>
      <Footer />
    </>
  )
}
