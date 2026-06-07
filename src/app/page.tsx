'use client'

/**
 * BAD DECISION AI — Main Application
 * Single-page app with view-based routing.
 * Uses Clerk for authentication and Supabase for data.
 */

import { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'
import { supabase } from '@/lib/supabase-client'
import { createTask, getUserTasks, getCollectionLeads, pollTaskUntilDone } from '@/lib/backend'

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
    setSelectedEngine,
    setSearchQuery,
    setTaskStatus,
    setLeads,
  } = useAppStore()

  const { isSignedIn, isLoaded, userId } = useAuth()
  const { user } = useUser()

  // Sync Clerk auth state with app store
  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && userId) {
      setAuthenticated(true)
      // If user is signed in and on a public page, go to dashboard
      if (['landing', 'signup', 'signin'].includes(view)) {
        setView('dashboard-idle')
      }
    } else {
      setAuthenticated(false)
      // If not signed in and on dashboard, go to landing
      if (view.startsWith('dashboard')) {
        setView('landing')
      }
    }
  }, [isSignedIn, isLoaded, userId])

  // Fetch user data from Supabase when signed in
  useEffect(() => {
    if (!isSignedIn || !userId) return

    // Detect geo
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => setUserCountry(data.country_code || 'US'))
      .catch(() => setUserCountry('US'))

    // Fetch coin balance from Supabase
    async function fetchUserData() {
      try {
        // Fetch usage_ledger
        const { data: ledger, error: ledgerError } = await supabase
          .from('usage_ledger')
          .select('coins_balance, coins_reserved, coins_lifetime')
          .eq('user_id', userId)
          .single()

        if (ledger && !ledgerError) {
          setCoinBalance({
            coins_balance: ledger.coins_balance,
            coins_reserved: ledger.coins_reserved,
            coins_lifetime: ledger.coins_lifetime,
          })
        } else {
          // If no ledger yet (webhook hasn't fired), set defaults
          setCoinBalance({ coins_balance: 50, coins_reserved: 0, coins_lifetime: 50 })
        }

        // Fetch profile for tier
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', userId)
          .single()

        if (profile && !profileError) {
          setTier(profile.tier || 'free')
        } else {
          setTier('free')
        }

        // Fetch search tasks (collections)
        const tasksData = await getUserTasks(userId!)
        if (tasksData.tasks && tasksData.tasks.length > 0) {
          const collections = tasksData.tasks.map((task: any) => ({
            id: task.id,
            name: task.query || 'Untitled Search',
            task_type: task.task_type,
            lead_count: task.lead_count || 0,
            created_at: task.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          }))
          setCollections(collections)
        }
      } catch (err) {
        console.error('[APP] Error fetching user data:', err)
        // Fallback to defaults
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
