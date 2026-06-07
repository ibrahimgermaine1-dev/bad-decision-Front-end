'use client'

/**
 * BAD DECISION AI — Main Application
 * Single-page app with view-based routing.
 * Real Clerk auth integration — routes based on isSignedIn.
 * Fetches real data from backend on auth.
 * NO EMOJIS. Premium typography. Direct-response copy.
 * Color system: Midnight #0B1120, Royal Blue #2563EB, Surface #F8FAFC
 */

import { useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'
import { fetchCoinBalance, fetchCollections } from '@/lib/api'

// View components
import { LandingPage } from '@/components/landing'
import { PricingPage } from '@/components/pricing'
import { FAQPage } from '@/components/faq'
import { ContactPage } from '@/components/contact'
import { AuthPage } from '@/components/auth'
import { DashboardShell } from '@/components/dashboard'

export default function BadDecisionAI() {
  const { isSignedIn, isLoaded, userId } = useAuth()
  const { view, setView, setUserCountry, setCoinBalance, setTier, setCollections } = useAppStore()
  const authSynced = useRef(false)

  // Detect geo on mount
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => setUserCountry(data.country_code || 'US'))
      .catch(() => setUserCountry('US'))
  }, [setUserCountry])

  // Sync auth state with view routing — runs only when auth state changes
  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && userId) {
      // Prevent duplicate fetches from React strict mode re-renders
      if (!authSynced.current) {
        authSynced.current = true

        // Fetch real data from backend
        fetchCoinBalance()
          .then(balance => {
            setCoinBalance({
              coins_balance: balance.coins_balance ?? 0,
              coins_reserved: balance.coins_reserved ?? 0,
              coins_lifetime: balance.coins_lifetime ?? 0,
            })
          })
          .catch(err => {
            console.warn('[App] Failed to fetch coin balance:', err)
            setCoinBalance({ coins_balance: 0, coins_reserved: 0, coins_lifetime: 0 })
          })

        fetchCollections(userId)
          .then(cols => setCollections(cols))
          .catch(err => console.warn('[App] Failed to fetch collections:', err))
      }

      // If currently on auth views, redirect to dashboard
      if (view === 'signin' || view === 'signup') {
        setView('dashboard-idle')
      }
    } else if (!isSignedIn) {
      // Reset auth sync flag when signed out
      authSynced.current = false

      // If on dashboard views, redirect to landing
      if (view.startsWith('dashboard')) {
        setView('landing')
      }
    }
  }, [isSignedIn, isLoaded, userId]) // eslint-disable-line react-hooks/exhaustive-deps

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
      // Only show dashboard if signed in
      if (isSignedIn) {
        return <DashboardShell />
      }
      // Not signed in — redirect to landing
      return <LandingPage />
    default:
      return <LandingPage />
  }
}
