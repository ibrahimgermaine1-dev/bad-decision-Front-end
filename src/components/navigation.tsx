'use client'

/**
 * SHARED NAVIGATION — Used on every marketing page
 * Full nav links: Solutions, Pricing, FAQ, Contact
 * Auth buttons: Sign In, Get Started Free
 */

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

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => setView('landing')} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BD</span>
          </div>
          <span className="font-semibold text-[#0F172A] tracking-tight">Bad Decision AI</span>
        </button>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.key}
              onClick={() => setView(link.key)}
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
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setView('signin')} className="border-[#E2E8F0] text-[#0F172A]">
            Sign In
          </Button>
          <Button size="sm" onClick={() => setView('signup')} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
            Get Started Free
          </Button>
        </div>
      </div>
    </nav>
  )
}
