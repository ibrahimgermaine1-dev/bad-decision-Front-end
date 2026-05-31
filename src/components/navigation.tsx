'use client'

/**
 * SHARED NAVIGATION — Used on every marketing page
 * Full nav links: Solutions, Pricing, FAQ, Contact
 * Auth buttons: Sign In, Get Started Free
 * Mobile hamburger menu for small screens
 */

import { useState } from 'react'
import { useAppStore } from '@/stores/app-store'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { key: 'solutions', label: 'Solutions' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'faq', label: 'FAQ' },
  { key: 'contact', label: 'Contact' },
] as const

export function Navigation() {
  const { setView, view } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavClick = (key: string) => {
    setView(key as any)
    setMobileOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => handleNavClick('landing')} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BD</span>
          </div>
          <span className="font-semibold text-[#0F172A] tracking-tight">Bad Decision AI</span>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.key}
              onClick={() => handleNavClick(link.key)}
              className={`text-sm transition-colors ${
                view === link.key
                  ? 'text-[#2563EB] font-medium'
                  : 'text-[#0F172A] hover:text-[#2563EB]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleNavClick('signin')} className="border-[#E2E8F0] text-[#0F172A]">
            Sign In
          </Button>
          <Button size="sm" onClick={() => handleNavClick('signup')} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
            Get Started Free
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E2E8F0] shadow-lg">
          <div className="px-6 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.key}
                onClick={() => handleNavClick(link.key)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  view === link.key
                    ? 'bg-[#DBEAFE] text-[#2563EB]'
                    : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="px-6 pb-4 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => handleNavClick('signin')}
              className="w-full border-[#E2E8F0] text-[#0F172A]"
            >
              Sign In
            </Button>
            <Button
              onClick={() => handleNavClick('signup')}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
