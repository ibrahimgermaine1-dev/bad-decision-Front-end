'use client'

/**
 * BAD DECISION AI — Main Application
 * Single-page app with view-based routing.
 * Integrates with Clerk for real authentication.
 * Falls back to demo mode when Clerk is not configured.
 */

import { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'

// View components
import { LandingPage } from '@/components/landing'
import { PricingPage } from '@/components/pricing'
import { FAQPage } from '@/components/faq'
import { ContactPage } from '@/components/contact'
import { AuthPage } from '@/components/auth'
import { DashboardShell } from '@/components/dashboard'
import { SolutionsPage } from '@/components/solutions'

export default function BadDecisionAI() {
  const { view, setUserCountry, setCoinBalance, setTier, setCollections, setClerkId, setUserEmail, setUserName, setAuthenticated, syncFromBackend } = useAppStore()

  // Clerk auth hooks
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()

  // Detect geo on mount
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => setUserCountry(data.country_code || 'US'))
      .catch(() => setUserCountry('US'))
  }, [setUserCountry])

  // Sync Clerk auth state with our store
  useEffect(() => {
    if (isSignedIn && userId) {
      // User is authenticated via Clerk
      setClerkId(userId)
      setUserEmail(user?.primaryEmailAddress?.emailAddress || null)
      setUserName(user?.fullName || null)
      setAuthenticated(true)

      // Sync their data from backend
      syncFromBackend()
    } else {
      // Not authenticated — use demo data
      setClerkId(null)
      setUserEmail(null)
      setUserName(null)
      setAuthenticated(false)

      // Only set demo data if user hasn't already synced
      const { coinBalance } = useAppStore.getState()
      if (coinBalance.coins_lifetime === 0) {
        setCoinBalance({ coins_balance: 50, coins_reserved: 0, coins_lifetime: 50 })
        setTier('free')
        setCollections([
          { id: '1', name: 'Roofers in Texas', task_type: 'ads_intent', lead_count: 12, created_at: '2026-05-30' },
          { id: '2', name: 'Bakeries in Lagos', task_type: 'smb_maps', lead_count: 8, created_at: '2026-05-29' },
        ])
      }
    }
  }, [isSignedIn, userId, user, setClerkId, setUserEmail, setUserName, setAuthenticated, setCoinBalance, setTier, setCollections, syncFromBackend])

  // Route to the correct view
  switch (view) {
    case 'landing':
      return <LandingPage />
    case 'solutions':
      return <SolutionsPage />
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
