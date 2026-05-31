'use client'

/**
 * BAD DECISION AI — Main Application
 * Single-page app with view-based routing.
 * NO EMOJIS. Premium typography. Direct-response copy.
 * Color system: Midnight #0B1120, Royal Blue #2563EB, Surface #F8FAFC
 */

import { useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'

// View components
import { LandingPage } from '@/components/landing'
import { PricingPage } from '@/components/pricing'
import { FAQPage } from '@/components/faq'
import { ContactPage } from '@/components/contact'
import { AuthPage } from '@/components/auth'
import { DashboardShell } from '@/components/dashboard'

export default function BadDecisionAI() {
  const { view, setUserCountry, setCoinBalance, setTier, setCollections } = useAppStore()

  // Detect geo on mount
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => setUserCountry(data.country_code || 'US'))
      .catch(() => setUserCountry('US'))

    // Demo data (in production, this comes from Clerk + Supabase)
    setCoinBalance({ coins_balance: 50, coins_reserved: 0, coins_lifetime: 50 })
    setTier('free')
    setCollections([
      { id: '1', name: 'Roofers in Texas', task_type: 'ads_intent', lead_count: 12, created_at: '2026-05-30' },
      { id: '2', name: 'Bakeries in Lagos', task_type: 'smb_maps', lead_count: 8, created_at: '2026-05-29' },
    ])
  }, [setUserCountry, setCoinBalance, setTier, setCollections])

  // Route to the correct view
  switch (view) {
    case 'landing':
      return <LandingPage />
    case 'pricing':
      return <PricingPage />
    case 'faq':
      return <FAQPage />
    case 'contact':
      return <ContactPage />
    case 'signup':
    case 'signin':
      return <AuthPage />
    case 'dashboard-idle':
    case 'dashboard-searching':
    case 'dashboard-results':
    case 'dashboard-coin-vault':
    case 'dashboard-support':
      return <DashboardShell />
    default:
      return <LandingPage />
  }
}
