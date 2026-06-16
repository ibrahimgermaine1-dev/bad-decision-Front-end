'use client'

/**
 * Premium Navbar — Dark, sophisticated, responsive.
 * Sticky top with glass effect. Mobile hamburger menu.
 */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'

const NAV_LINKS = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/case-studies', label: 'Results' },
  { href: '/guarantee', label: 'Guarantee' },
  { href: '/faq', label: 'FAQ' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const { setUserCountry } = useAppStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Detect user country for pricing currency
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => setUserCountry(data.country_code || 'US'))
      .catch(() => setUserCountry('US'))
  }, [setUserCountry])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#08080C]/80 backdrop-blur-xl border-b border-[#25252F]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#7C5CFC]/20 transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-[15px] text-[#F5F5F7] tracking-tight">Bad Decision</span>
              <span className="block text-[10px] text-[#6B6B7B] -mt-0.5 tracking-wide uppercase">Lead Intelligence</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-[#F5F5F7] bg-[#1A1A24]'
                    : 'text-[#A8A8B8] hover:text-[#F5F5F7] hover:bg-[#14141C]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-[14px] font-semibold transition-colors shadow-lg shadow-[#7C5CFC]/20"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-4 py-2.5 rounded-lg text-[#A8A8B8] hover:text-[#F5F5F7] text-[14px] font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-5 py-2.5 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-[14px] font-semibold transition-colors shadow-lg shadow-[#7C5CFC]/20"
                >
                  Get 50 Free Leads
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-[#F5F5F7] hover:bg-[#14141C] transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#25252F] py-4 space-y-1 animate-fade-in-up">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-[#F5F5F7] bg-[#1A1A24]'
                    : 'text-[#A8A8B8] hover:text-[#F5F5F7] hover:bg-[#14141C]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-[#25252F] space-y-2">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 rounded-lg bg-[#7C5CFC] text-white text-center text-[15px] font-semibold"
                >
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="block px-4 py-3 rounded-lg text-[#A8A8B8] text-center text-[15px] font-medium border border-[#25252F]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block px-4 py-3 rounded-lg bg-[#7C5CFC] text-white text-center text-[15px] font-semibold"
                  >
                    Get 50 Free Leads
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
