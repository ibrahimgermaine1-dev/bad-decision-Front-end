'use client'

/**
 * BAD DECISION AI — Main Application
 * Single-page app with view-based routing.
 * Uses Clerk for authentication and the FastAPI backend for ALL data.
 * NO direct Supabase calls from the frontend — everything goes through
 * the backend API to avoid UUID type mismatches.
 */

import { useEffect, useRef } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'

// View components
import { LandingPage } from '@/components/landing'
import { PricingPage } from '@/components/pricing'
import { FAQPage } from '@/components/faq'
import { ContactPage } from '@/components/contact'
import { AuthPage } from '@/components/auth'
import { DashboardShell } from '@/components/dashboard'

export default function BadDecisionAI() {
  const {
    view, setView,
    setUserCountry,
    setCoinBalance, setTier, setCollections,
    setAuthenticated,
  } = useAppStore()

  const { isSignedIn, isLoaded, userId } = useAuth()
  const { user } = useUser()

  // Track the last userId we fetched data for, to avoid re-fetching
  const lastFetchedUserId = useRef<string | null>(null)

  // Sync Clerk auth state with app store — but only on meaningful changes
  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && userId) {
      setAuthenticated(true)
      // Only redirect to dashboard if user is on the auth pages
      if (['signup', 'signin'].includes(view)) {
        setView('dashboard-idle')
      }
    } else {
      setAuthenticated(false)
      // Only redirect away from dashboard if NOT signed in
      if (view.startsWith('dashboard')) {
        setView('landing')
      }
    }
  }, [isSignedIn, isLoaded, userId]) // Intentionally NOT including `view` to avoid loops

  // Fetch user data from the backend when signed in
  useEffect(() => {
    if (!isSignedIn || !userId) return
    // Avoid re-fetching for the same user
    if (lastFetchedUserId.current === userId) return
    lastFetchedUserId.current = userId

    // Detect geo for Paystack currency
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => setUserCountry(data.country_code || 'US'))
      .catch(() => setUserCountry('US'))

    // Fetch user data from the backend API
    async function fetchUserData() {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bad-decision-backend-main.onrender.com'

      try {
        // Fetch profile + ledger from our backend
        const profileRes = await fetch(`${BACKEND_URL}/api/profile/${encodeURIComponent(userId!)}`)
        if (profileRes.ok) {
          const profileData = await profileRes.json()

          if (profileData.ledger) {
            setCoinBalance({
              coins_balance: profileData.ledger.coins_balance ?? 0,
              coins_reserved: profileData.ledger.coins_reserved ?? 0,
              coins_lifetime: profileData.ledger.coins_lifetime ?? 0,
            })
          } else {
            setCoinBalance({ coins_balance: 50, coins_reserved: 0, coins_lifetime: 50 })
          }

          if (profileData.profile) {
            setTier(profileData.profile.tier || 'free')
          } else {
            setTier('free')
          }
        } else {
          // Backend returned error — use defaults
          setCoinBalance({ coins_balance: 50, coins_reserved: 0, coins_lifetime: 50 })
          setTier('free')
        }

        // Fetch search tasks (collections)
        const tasksRes = await fetch(`${BACKEND_URL}/api/tasks/${encodeURIComponent(userId!)}`)
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          if (tasksData.tasks && tasksData.tasks.length > 0) {
            const collections = tasksData.tasks
              .filter((task: any) => task.status === 'completed')
              .map((task: any) => ({
                id: task.id,
                name: task.query || 'Untitled Search',
                task_type: task.task_type,
                lead_count: 0,
                created_at: task.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              }))
            setCollections(collections)
          }
        }
      } catch (err) {
        console.error('[APP] Error fetching user data:', err)
        // Set default free trial values
        setCoinBalance({ coins_balance: 50, coins_reserved: 0, coins_lifetime: 50 })
        setTier('free')
      }
    }

    fetchUserData()
  }, [isSignedIn, userId])

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
