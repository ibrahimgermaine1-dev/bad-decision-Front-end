'use client'

/**
 * BAD DECISION AI — Main Application
 * Single-page app with view-based routing.
 * Integrates with Clerk for real authentication.
 * Falls back to demo mode when Clerk is not configured.
 */

import { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useAppStore, type AppView } from '@/stores/app-store'

// View components
import { LandingPage } from '@/components/landing'
import { PricingPage } from '@/components/pricing'
import { FAQPage } from '@/components/faq'
import { ContactPage } from '@/components/contact'
import { AuthPage } from '@/components/auth'
import { DashboardShell } from '@/components/dashboard'
import { SolutionsPage } from '@/components/solutions'

// Valid views for URL param reading
const VALID_VIEWS: AppView[] = [
  'landing', 'pricing', 'faq', 'contact', 'solutions',
  'signup', 'signin',
  'dashboard-idle', 'dashboard-searching', 'dashboard-results',
  'dashboard-coin-vault', 'dashboard-support',
]

export default function BadDecisionAI() {
  const { view, setView, setUserCountry, setCoinBalance, setTier, setCollections, setClerkId, setUserEmail, setUserName, setAuthenticated, syncFromBackend } = useAppStore()

  // Clerk auth hooks
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()

  // ============================================================
  // READ URL PARAMS ON MOUNT
  // Handles direct URL access (/?view=signup) and Clerk's
  // redirectUrl / afterSignInUrl navigation.
  // ============================================================
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view')
    if (viewParam && VALID_VIEWS.includes(viewParam as AppView)) {
      setView(viewParam as AppView)
    }
  }, [setView])

  // Listen for browser back/forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const viewParam = params.get('view')
      if (viewParam && VALID_VIEWS.includes(viewParam as AppView)) {
        setView(viewParam as AppView)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [setView])

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

      // Auto-navigate to dashboard if currently on auth pages
      if (view === 'signup' || view === 'signin') {
        setView('dashboard-idle')
      }
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
  }, [isSignedIn, userId, user, setClerkId, setUserEmail, setUserName, setAuthenticated, setCoinBalance, setTier, setCollections, syncFromBackend, setView, view])

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
