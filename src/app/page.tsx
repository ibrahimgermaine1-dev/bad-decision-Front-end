'use client'

/**
 * BAD DECISION AI — Main Application (Root Page)
 * 
 * App Router routing: sign-in, sign-up, pricing, faq, dashboard all have
 * their own route files. This root page.tsx handles the "/" route only.
 * 
 * - Signed-in users on "/" → redirect to /dashboard
 * - Signed-out users on "/" → show LandingPage
 * - Geo detection runs for pricing currency
 */

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'
import { fetchCoinBalance, fetchCollections } from '@/lib/api'
import { LandingPage } from '@/components/landing'

export default function BadDecisionAI() {
  const { isSignedIn, isLoaded, userId } = useAuth()
  const router = useRouter()
  const { setUserCountry, setCoinBalance, setCollections } = useAppStore()
  const authSynced = useRef(false)
  const redirected = useRef(false)

  // Detect geo on mount
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => setUserCountry(data.country_code || 'US'))
      .catch(() => setUserCountry('US'))
  }, [setUserCountry])

  // Sync auth state — fetch data and redirect signed-in users to dashboard
  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && userId) {
      // Fetch coin balance and collections on auth
      if (!authSynced.current) {
        authSynced.current = true

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

      // Redirect signed-in users from "/" to "/dashboard"
      if (!redirected.current) {
        redirected.current = true
        router.replace('/dashboard')
      }
    } else {
      authSynced.current = false
    }
  }, [isSignedIn, isLoaded, userId, router, setCoinBalance, setCollections])

  // Show landing page while checking auth, or for signed-out users
  return <LandingPage />
}
