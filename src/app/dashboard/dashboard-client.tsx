'use client'

/**
 * DASHBOARD — Bad Decision
 * Completely rebuilt. Premium dark design. All bugs fixed.
 *
 * Fixes:
 * - selectedCountry/selectedState properly declared as state
 * - Credit balance fetched on mount and after payment
 * - Search sends correct params to backend
 * - Location selector with continent/country/state cascade
 * - Fully responsive (mobile, tablet, desktop)
 * - Payment via Paystack inline popup
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useAppStore, type EngineType, type Lead, type SmartCollection, type UserTier } from '@/stores/app-store'
import { startSearch, pollUntilComplete, fetchCreditBalance, verifyPayment, fetchCollections } from '@/lib/api'
import { CREDIT_ADDONS, type TierId, formatAddonPrice, isEngineAvailable, getCreditsPerLead } from '@/lib/pricing'
import { LocationSelector } from '@/components/location-selector'
import { exportLeadsToCsv, downloadCsv } from '@/lib/csv-shield'
import { ErrorBoundary } from '@/components/error-boundary'
import {
  DashboardSkeleton,
  BillingViewSkeleton,
  CollectionsViewSkeleton,
  CreditsViewSkeleton,
  MessagesViewSkeleton,
  SettingsViewSkeleton,
  LeadsSkeleton,
  Skeleton,
} from '@/components/ui/skeleton'

type DashView = 'search' | 'collections' | 'credits' | 'billing' | 'support' | 'messages' | 'settings'

// ============================================================
// OUTREACH COPYWRITING STYLES — mirrors backend enum
// (dan_kennedy | donald_miller | ray_edwards | david_ogilvy |
//  jay_abraham | gary_halbert)
// ============================================================
type CopywritingStyle = 'dan_kennedy' | 'donald_miller' | 'ray_edwards' | 'david_ogilvy' | 'jay_abraham' | 'gary_halbert'

const COPYWRITING_STYLES: { id: CopywritingStyle; name: string; desc: string }[] = [
  { id: 'david_ogilvy', name: 'David Ogilvy', desc: 'Classic, refined, research-driven storytelling.' },
  { id: 'dan_kennedy', name: 'Dan Kennedy', desc: 'Direct response, no-nonsense, magnetic.' },
  { id: 'donald_miller', name: 'Donald Miller', desc: 'StoryBrand — clear narrative, customer as hero.' },
  { id: 'ray_edwards', name: 'Ray Edwards', desc: 'Inspiring, transformation-focused.' },
  { id: 'jay_abraham', name: 'Jay Abraham', desc: 'Strategy-rich, leverage-focused, opportunity-driven.' },
  { id: 'gary_halbert', name: 'Gary Halbert', desc: 'Punchy, provocative, mail-order classic.' },
]

const ENGINE_CARDS = [
  {
    id: 'companies' as EngineType,
    title: 'Companies And Professionals',
    desc: 'Find any type of business in any location. Service providers, manufacturers, clinics, agencies, contractors, retailers, and more.',
    creditCost: 1,
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 'ads_running' as EngineType,
    title: 'Businesses Running Ads',
    desc: 'Find businesses actively spending money on ads. They have budgets and are ready to buy.',
    creditCost: 2,
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  },
  {
    id: 'ecommerce' as EngineType,
    title: 'Ecommerce Brands',
    desc: 'Find online stores and get deep data: what they sell, what tools they use, how to reach them. Returns thousands of leads per search.',
    creditCost: 2,
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  },
]

export function DashboardShell() {
  const router = useRouter()
  const { isSignedIn, isLoaded, userId } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()

  const {
    creditBalance, setCreditBalance,
    tier, setTier,
    userCountry,
    collections, setCollections,
  } = useAppStore()

  // ===== STATE (all properly declared — fixes selectedCountry bug) =====
  const [activeView, setActiveView] = useState<DashView>('search')
  const [selectedEngine, setSelectedEngine] = useState<EngineType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  // Default country comes from the navbar's IP detection (stored in userCountry).
  // Falls back to 'NG' (the founder's primary market) if detection hasn't run yet.
  const [selectedCountry, setSelectedCountry] = useState(userCountry || 'NG')
  const [selectedState, setSelectedState] = useState('')
  const [searchStatus, setSearchStatus] = useState<'idle' | 'processing' | 'completed' | 'failed' | 'exhausted'>('idle')
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchError, setSearchError] = useState('')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [taskId, setTaskId] = useState<string | undefined>(undefined)
  // Tracks whether the initial profile + balance fetch has finished.
  // Until it has, we render a full-screen spinner so the user never sees
  // a flash of "0 credits / free tier" before real data arrives.
  const [dashboardLoaded, setDashboardLoaded] = useState(false)

  // ===== FETCH CREDIT BALANCE =====
  const loadBalance = useCallback(async () => {
    if (!userId) return
    try {
      const balance = await fetchCreditBalance()
      setCreditBalance({
        credits_balance: balance.credits_balance ?? 0,
        credits_reserved: balance.credits_reserved ?? 0,
        total_purchased: balance.total_purchased ?? 0,
      })
    } catch (err) {
      console.warn('[Dashboard] Failed to fetch credit balance:', err)
    }
  }, [userId, setCreditBalance])

  // ===== FETCH USER PROFILE (sets the real tier — fixes engine locking for paid users) =====
  const loadProfile = useCallback(async () => {
    if (!userId) return
    try {
      const res = await fetch('/api/backend/profile')
      if (!res.ok) return
      const data = await res.json()
      const profileTier = data?.profile?.tier
      if (profileTier) {
        // Coerce to UserTier — backend may return unknown strings, in which case we fall back to 'free'.
        const validTiers: UserTier[] = ['free', 'starter', 'growth', 'pro']
        const safeTier = (validTiers as string[]).includes(profileTier) ? (profileTier as UserTier) : 'free'
        setTier(safeTier)
      }
    } catch (err) {
      console.warn('[Dashboard] Failed to fetch profile:', err)
    }
  }, [userId, setTier])

  // ===== RELOAD LEADS for the current task — used after batch outreach generation =====
  // After "Write Messages for All" completes, the backend has updated each lead's
  // outreach_email/social/call fields, but our local `leads` state is stale.
  // Re-fetching via /api/backend/leads?task_id=xxx returns the freshly-saved messages
  // so each lead card immediately shows them instead of the empty "Write" button.
  const reloadLeads = useCallback(async (taskUuid?: string) => {
    const effectiveTaskId = taskUuid || taskId
    if (!effectiveTaskId) return
    try {
      const res = await fetch(`/api/backend/leads?task_id=${encodeURIComponent(effectiveTaskId)}`, {
        method: 'GET',
      })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.leads)) {
        setLeads(data.leads)
      }
    } catch (err) {
      console.warn('[Dashboard] Failed to reload leads after batch outreach:', err)
    }
  }, [taskId, setLeads])

  // ===== ON MOUNT: redirect if not signed in, otherwise load balance + profile in parallel =====
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in')
      return
    }
    if (!isLoaded || !isSignedIn) return

    let cancelled = false
    Promise.allSettled([loadBalance(), loadProfile()]).finally(() => {
      if (!cancelled) setDashboardLoaded(true)
    })
    return () => { cancelled = true }
  }, [isLoaded, isSignedIn, router, loadBalance, loadProfile])

  // ===== SYNC selectedCountry when userCountry arrives from IP detection =====
  // The navbar calls ipapi.co on mount to detect the user's country. That
  // value lands in `userCountry` AFTER this component's first render. If the
  // user hasn't manually changed their country yet, sync it from the store
  // so the dropdown shows the right default.
  const [countryManuallySet, setCountryManuallySet] = useState(false)
  useEffect(() => {
    if (!countryManuallySet && userCountry && userCountry !== selectedCountry) {
      setSelectedCountry(userCountry)
    }
  }, [userCountry, countryManuallySet, selectedCountry])

  const handleCountryChange = useCallback((country: string) => {
    setSelectedCountry(country)
    setCountryManuallySet(true)
  }, [])

  // ===== FETCH COLLECTIONS =====
  useEffect(() => {
    if (userId) {
      fetchCollections(userId).then(cols => setCollections(cols)).catch(() => {})
    }
  }, [userId, setCollections])

  // ===== HANDLE SEARCH =====
  const handleSearch = useCallback(async () => {
    if (!selectedEngine) {
      setSearchError('Pick a search type first.')
      return
    }
    if (!searchQuery.trim()) {
      setSearchError('Type what you want to find.')
      return
    }

    setSearchStatus('processing')
    setSearchError('')
    setLeads([])
    setProgress(5)
    setCurrentStep('Starting search...')

    try {
      // Reserve credits for this search. We send the user's full balance
      // (or a reasonable max). The backend reserves it all, then commits
      // only what's actually spent (leads_found × credits_per_lead) and
      // refunds the rest. This way the search works as long as the user
      // has at least 1 credit.
      const creditsToReserve = Math.min(Math.max(creditBalance.credits_balance, 1), 100)

      const searchResult = await startSearch(
        selectedEngine,
        searchQuery.trim(),
        selectedCountry,
        selectedState,
        creditsToReserve
      )

      if (!searchResult.task_id) {
        throw new Error(searchResult.message || searchResult.detail || 'No task ID returned')
      }

      // Store the task_id so ResultsView can use it for "Write Messages for All"
      setTaskId(searchResult.task_id)

      const finalStatus = await pollUntilComplete(
        searchResult.task_id,
        (status) => {
          if (status.status === 'processing') {
            // Use the actual progress and step from the backend
            if (status.progress !== undefined) {
              setProgress(status.progress)
            }
            if (status.current_step) {
              setCurrentStep(status.current_step)
            }
          }
        }
      )

      if (finalStatus.status === 'completed') {
        setLeads(finalStatus.leads || [])
        setSearchStatus('completed')
        setProgress(100)
        setCurrentStep(`Search complete! Found ${(finalStatus.leads || []).length} leads.`)
      } else if (finalStatus.status === 'exhausted') {
        setSearchStatus('exhausted')
        setCurrentStep('')
      } else if (finalStatus.status === 'failed') {
        setSearchStatus('failed')
        setCurrentStep('')
        setSearchError(finalStatus.error_message || finalStatus.error || finalStatus.detail || 'Search failed. Try again.')
      }

      // Refresh balance after search (credits were deducted)
      loadBalance()
    } catch (err: any) {
      console.error('[Dashboard] Search error:', err)
      setSearchStatus('failed')
      setSearchError(err.message || 'Something went wrong. Try again.')
    }
  }, [selectedEngine, searchQuery, selectedCountry, selectedState, loadBalance, creditBalance.credits_balance])

  // ===== HANDLE PAYMENT (Paystack) =====
  const handleBuyCredits = async (addon: typeof CREDIT_ADDONS[0]) => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setPaymentError('Paystack public key is not configured. Go to Vercel → Settings → Environment Variables and set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to your Paystack public key (pk_test_... or pk_live_...).')
      return
    }

    if (!user?.primaryEmailAddress?.emailAddress) {
      setPaymentError('No email address found. Please sign out and sign back in.')
      return
    }

    setPaymentProcessing(true)
    setPaymentError('')

    try {
      // Dynamically load Paystack script if not already loaded
      if (typeof window !== 'undefined' && !(window as any).PaystackPop) {
        console.log('[Payment] Paystack script not loaded, loading dynamically...')
        await new Promise<void>((resolve, reject) => {
          const existingScript = document.querySelector('script[src="https://js.paystack.co/v2/inline.js"]')
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve())
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack script')))
            return
          }
          const script = document.createElement('script')
          script.src = 'https://js.paystack.co/v2/inline.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Paystack script'))
          document.head.appendChild(script)
        })

        // Wait a moment for the script to initialize
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        const paystackRef = crypto.randomUUID()
        console.log('[Payment] Starting Paystack payment:', { paystackRef, amount: addon.priceKobo, email: user.primaryEmailAddress.emailAddress })
        const handler = (window as any).PaystackPop.setup({
          ref: paystackRef,
          email: user.primaryEmailAddress.emailAddress,
          amount: addon.priceKobo,
          key: publicKey,
          currency: 'NGN',
          metadata: {
            user_id: userId || '',
            credits: addon.credits,
            type: 'credit_addon',
          },
          callback: (response: any) => {
            const ref = response?.reference || ''
            console.log('[Payment] Paystack callback received:', { ref, response })
            if (ref) {
              verifyPayment(ref).then((result) => {
                console.log('[Payment] Verify result:', result)
                if (result.verified && result.balance) {
                  setCreditBalance({
                    credits_balance: result.balance.credits_balance ?? 0,
                    credits_reserved: result.balance.credits_reserved ?? 0,
                    total_purchased: result.balance.total_purchased ?? 0,
                  })
                } else {
                  setPaymentError('Payment was processed but verification failed. Your credits will be added within a minute.')
                  setTimeout(() => loadBalance(), 5000)
                }
                setPaymentProcessing(false)
              }).catch((err) => {
                console.error('[Payment] Verify error:', err)
                setPaymentError('Payment was processed. Your credits will be added within a minute.')
                setTimeout(() => loadBalance(), 5000)
                setPaymentProcessing(false)
              })
            } else {
              setPaymentError('Payment completed but no reference was returned. Please contact support.')
              setTimeout(() => loadBalance(), 5000)
              setPaymentProcessing(false)
            }
          },
          onClose: () => {
            console.log('[Payment] Paystack popup closed')
            setPaymentProcessing(false)
          },
        })
        handler.openIframe()
      } else {
        setPaymentError('Could not load Paystack payment. Please check your internet connection and try again.')
        setPaymentProcessing(false)
      }
    } catch (err: any) {
      console.error('[Payment] Error:', err)
      setPaymentError(err.message || 'Payment failed. Please try again.')
      setPaymentProcessing(false)
    }
  }

  const [signingOut, setSigningOut] = useState(false)
  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      router.push('/')
    } catch (err) {
      console.error('Sign out error:', err)
      window.location.href = '/'
    } finally {
      setSigningOut(false)
    }
  }

  // ===== LOADING STATE =====
  // TRUE skeleton screen — empty boxes matching the dashboard layout.
  // This avoids flashing default content before real user data arrives.
  if (!isLoaded || !isSignedIn || !dashboardLoaded) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Script src="https://js.paystack.co/v2/inline.js" />

      {/* ===== MOBILE HEADER ===== */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border h-14 flex items-center justify-between px-4"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-card-foreground/10 active:bg-card-foreground/15 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-card-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">BD</span>
            </div>
            <span className="font-bold text-[14px] text-card-foreground">Bad Decision</span>
          </div>
        </div>
        <button
          onClick={() => { setActiveView('credits') }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card-foreground/10 border border-primary/20 active:scale-95 transition-transform"
          aria-label="View credits"
        >
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="text-[13px] font-bold text-card-foreground tabular-nums">{creditBalance.credits_balance}</span>
          <span className="text-[10px] text-card-foreground/60 uppercase font-semibold hidden min-[400px]:inline">{tier}</span>
        </button>
      </div>

      {/* ===== SIDEBAR ===== */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            style={{ animation: 'fade-in-up 0.2s ease-out' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-50 lg:z-30
            h-screen w-[280px] sm:w-64 flex-shrink-0
            bg-card border-r border-border
            flex flex-col
            transition-transform duration-300 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Logo + close button (mobile) */}
          <div className="h-14 flex items-center justify-between gap-2.5 px-4 border-b border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                <span className="text-white font-bold text-xs">BD</span>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[14px] text-card-foreground truncate">Bad Decision</div>
                <div className="text-[9px] text-card-foreground/60 uppercase tracking-wide">Lead Intelligence</div>
              </div>
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-card-foreground/10 active:bg-card-foreground/15 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-card-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Credit Balance Card */}
          <div className="p-3">
            <div className="rounded-xl bg-card-foreground/5 border border-primary/20 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-card-foreground/70 uppercase tracking-wide font-medium">Credits Remaining</span>
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-card-foreground tabular-nums">{creditBalance.credits_balance}</div>
                {creditBalance.credits_reserved > 0 && (
                  <div className="text-[11px] text-card-foreground/60">
                    <span className="tabular-nums">{creditBalance.credits_reserved}</span> reserved
                  </div>
                )}
              </div>
              <button
                onClick={() => { setActiveView('credits'); setSidebarOpen(false) }}
                className={`w-full mt-2.5 py-2.5 rounded-lg text-[12px] font-bold transition-all active:scale-95 ${
                  creditBalance.credits_balance <= 0
                    ? 'bg-destructive hover:bg-destructive/90 text-white animate-pulse shadow-lg shadow-destructive/30'
                    : 'bg-primary hover:bg-primary/90 text-white shadow-sm'
                }`}
              >
                {creditBalance.credits_balance <= 0 ? 'GET CREDITS NOW' : 'Get More Credits'}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
            <NavItem
              icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              label="Search"
              active={activeView === 'search'}
              onClick={() => { setActiveView('search'); setSidebarOpen(false) }}
            />
            <NavItem
              icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              label="Collections"
              active={activeView === 'collections'}
              onClick={() => { setActiveView('collections'); setSidebarOpen(false) }}
              badge={collections.length > 0 ? String(collections.length) : undefined}
            />
            <NavItem
              icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              label="Credit Vault"
              active={activeView === 'credits'}
              onClick={() => { setActiveView('credits'); setSidebarOpen(false) }}
            />
            <NavItem
              icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              label="Billing"
              active={activeView === 'billing'}
              onClick={() => { setActiveView('billing'); setSidebarOpen(false) }}
            />
            <NavItem
              icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              label="Messages"
              active={activeView === 'messages'}
              onClick={() => { setActiveView('messages'); setSidebarOpen(false) }}
            />
            <NavItem
              icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              label="Settings"
              active={activeView === 'settings'}
              onClick={() => { setActiveView('settings'); setSidebarOpen(false) }}
            />
            <NavItem
              icon="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              label="Support"
              active={activeView === 'support'}
              onClick={() => { setActiveView('support'); setSidebarOpen(false) }}
            />
          </nav>

          {/* User Section */}
          <div className="p-2 border-t border-border">
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 mb-1.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">
                  {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-card-foreground truncate">
                  {user?.firstName || user?.fullName || 'Account'}
                </div>
                <div className="text-[10px] text-card-foreground/60 uppercase tracking-wide">{tier} plan</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-destructive/80 hover:text-destructive hover:bg-destructive/10 text-[12px] font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-wait disabled:hover:bg-transparent"
            >
              {signingOut ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </aside>
      </>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 min-w-0 pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ErrorBoundary>
            {activeView === 'search' && (
              <SearchView
                selectedEngine={selectedEngine}
                setSelectedEngine={setSelectedEngine}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCountry={selectedCountry}
              setSelectedCountry={handleCountryChange}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              searchStatus={searchStatus}
              searchError={searchError}
              leads={leads}
              progress={progress}
              currentStep={currentStep}
              onSearch={handleSearch}
              creditBalance={creditBalance.credits_balance}
              tier={tier}
              taskId={taskId}
              onLeadsUpdated={() => { reloadLeads(); loadBalance() }}
            />
          )}
          {activeView === 'collections' && (
            <CollectionsView collections={collections} />
          )}
          {activeView === 'credits' && (
            <CreditsView
              creditBalance={creditBalance}
              tier={tier}
              onBuyCredits={handleBuyCredits}
              paymentProcessing={paymentProcessing}
              paymentError={paymentError}
              userCountry={userCountry}
            />
          )}
          {activeView === 'billing' && (
            <BillingView tier={tier} onTierChange={() => loadProfile()} />
          )}
          {activeView === 'messages' && (
            <MessagesView />
          )}
          {activeView === 'settings' && (
            <SettingsView tier={tier} />
          )}
          {activeView === 'support' && (
            <SupportView />
          )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}

// ============================================================
// NAV ITEM
// ============================================================
function NavItem({ icon, label, active, onClick, badge }: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
  badge?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
        active
          ? 'bg-card-foreground/10 text-card-foreground border border-primary/20'
          : 'text-card-foreground/70 hover:text-card-foreground hover:bg-card-foreground/10'
      }`}
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
      </svg>
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[11px] font-bold">
          {badge}
        </span>
      )}
    </button>
  )
}

// ============================================================
// SEARCH VIEW
// ============================================================
function SearchView({
  selectedEngine, setSelectedEngine,
  searchQuery, setSearchQuery,
  selectedCountry, setSelectedCountry,
  selectedState, setSelectedState,
  searchStatus, searchError, leads, progress, currentStep, onSearch, creditBalance, tier,
  taskId, onLeadsUpdated
}: {
  selectedEngine: EngineType | null
  setSelectedEngine: (e: EngineType | null) => void
  searchQuery: string
  setSearchQuery: (s: string) => void
  selectedCountry: string
  setSelectedCountry: (s: string) => void
  selectedState: string
  setSelectedState: (s: string) => void
  searchStatus: 'idle' | 'processing' | 'completed' | 'failed' | 'exhausted'
  searchError: string
  leads: Lead[]
  progress: number
  currentStep: string
  onSearch: () => void
  creditBalance: number
  tier: string
  taskId?: string
  onLeadsUpdated?: () => void
}) {
  const activeEngine = ENGINE_CARDS.find(e => e.id === selectedEngine)
  const hasNoCredits = creditBalance <= 0
  const canSearch = selectedEngine && searchQuery.trim() && searchStatus !== 'processing' && !hasNoCredits
  const isLocked = (engineId: EngineType) => !isEngineAvailable(engineId, tier as TierId) || hasNoCredits

  const handleEngineClick = (engineId: EngineType) => {
    if (hasNoCredits) {
      window.location.href = '/pricing#pricing-table'
      return
    }
    if (isLocked(engineId)) {
      window.location.href = '/pricing#pricing-table'
    } else {
      setSelectedEngine(engineId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Find Real Buyers</h1>
        <p className="text-[14px] text-muted-foreground">Type what you want. Pick a location. Hit search. Get verified contacts.</p>
      </div>

      {/* No Credits Warning */}
      {hasNoCredits && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-[16px] font-bold text-destructive mb-1">You are out of credits</h3>
            <p className="text-[13px] text-muted-foreground">Upgrade your plan or buy more credits to keep finding leads.</p>
          </div>
          <a
            href="/pricing#pricing-table"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-[14px] font-bold transition-all shadow-lg shadow-primary/30 whitespace-nowrap"
          >
            Get More Credits
          </a>
        </div>
      )}

      {/* Engine Selection */}
      <div>
        <label className="block text-[12px] font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          What do you want to find?
        </label>
        {selectedEngine ? (
          <div className="card-premium p-4 mb-3 border-primary/30">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={activeEngine?.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[15px] text-foreground truncate">{activeEngine?.title}</div>
                  <div className="text-[12px] text-muted-foreground truncate">{activeEngine?.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2.5 py-1 rounded-md bg-muted text-[12px] font-bold text-primary">
                  {getCreditsPerLead(tier as TierId)} credits
                </span>
                <button
                  onClick={() => setSelectedEngine(null)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ENGINE_CARDS.map(engine => {
              const locked = isLocked(engine.id)
              return (
                <button
                  key={engine.id}
                  onClick={() => handleEngineClick(engine.id)}
                  className={`card-premium p-4 text-left transition-all group relative ${
                    locked
                      ? 'opacity-70 cursor-pointer border-border hover:border-warning/40'
                      : 'hover:border-primary/30'
                  }`}
                >
                  {locked && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-warning/15 border border-warning/30 text-[10px] font-bold text-warning uppercase tracking-wide flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Upgrade
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      locked
                        ? 'bg-muted border border-border'
                        : 'bg-muted border border-border group-hover:bg-primary group-hover:border-primary'
                    }`}>
                      <svg className={`w-5 h-5 transition-colors ${locked ? 'text-muted-foreground' : 'text-primary group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={engine.icon} />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`font-semibold text-[14px] ${locked ? 'text-muted-foreground' : 'text-foreground'}`}>{engine.title}</span>
                        {!locked && (
                          <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-bold text-primary flex-shrink-0">
                            {getCreditsPerLead(tier as TierId)} credits
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-muted-foreground">{engine.desc}</p>
                      {locked && (
                        <a
                          href="/pricing#pricing-table"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 mt-2 text-[12px] font-semibold text-warning hover:text-warning/80 transition-colors"
                        >
                          Upgrade to unlock
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Location + Query */}
      {selectedEngine && (
        <div className="card-premium p-5 space-y-4">
          <LocationSelector
            country={selectedCountry}
            stateRegion={selectedState}
            onCountryChange={setSelectedCountry}
            onStateChange={setSelectedState}
          />

          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              What are you looking for?
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canSearch && onSearch()}
              placeholder="e.g. roofers, bakeries, dentists, plumbers..."
              className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[15px] outline-none transition-colors"
            />
          </div>

          {searchError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-[13px] text-destructive">{searchError}</p>
            </div>
          )}

          <button
            onClick={onSearch}
            disabled={!canSearch}
            className={`w-full py-3.5 rounded-lg font-semibold text-[15px] transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg ${
              hasNoCredits
                ? 'bg-destructive/80 hover:bg-destructive text-white shadow-destructive/20'
                : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
            }`}
          >
            {searchStatus === 'processing' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Searching...
              </span>
            ) : hasNoCredits ? (
              <span className="flex items-center justify-center gap-2">
                Out of Credits · Upgrade to Search
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Search · {getCreditsPerLead(tier as TierId)} credits
                <span className="text-[12px] opacity-70">(You have {creditBalance})</span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Progress Bar + Live Steps */}
      {searchStatus === 'processing' && (
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] text-foreground font-semibold">{currentStep || 'Scanning the live internet...'}</span>
            <span className="text-[13px] text-primary font-semibold">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[12px] text-muted-foreground mt-2">
            We are finding real businesses and testing every email. This takes a few minutes.
          </p>

          {/* Skeleton Lead Rows — empty placeholders matching real card layout */}
          <div className="mt-4">
            <LeadsSkeleton count={4} />
          </div>
        </div>
      )}

      {/* Results */}
      {searchStatus === 'completed' && (
        <ResultsView leads={leads} engineType={selectedEngine} taskId={taskId} onLeadsUpdated={onLeadsUpdated} />
      )}

      {searchStatus === 'exhausted' && (
        <div className="card-premium p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-warning/15 border border-warning/20 mb-4">
            <svg className="w-7 h-7 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No leads found this time.</h3>
          <p className="text-[14px] text-muted-foreground max-w-md mx-auto">
            We searched but could not find enough verified businesses matching your query.
            Try a different search term or a different location. Your credits were not spent.
          </p>
        </div>
      )}

      {searchStatus === 'failed' && (
        <div className="card-premium p-8 text-center border-destructive/20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
            <svg className="w-7 h-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Search failed.</h3>
          <p className="text-[14px] text-muted-foreground mb-4">{searchError}</p>
          <button
            onClick={onSearch}
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[14px] font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================
// RESULTS VIEW — engine-specific layouts
// ============================================================
function ResultsView({ leads, engineType, taskId, onLeadsUpdated }: { leads: Lead[], engineType: EngineType | null, taskId?: string, onLeadsUpdated?: () => void }) {
  const { tier } = useAppStore()
  const showMessaging = tier === 'growth' || tier === 'pro'
  const isPro = tier === 'pro'
  const [sortBy, setSortBy] = useState<string>('default')
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchResult, setBatchResult] = useState('')
  // Modal state for the "Write Messages for All" smart dialog.
  // When the user clicks the batch button, we check how many leads already
  // have outreach messages. If some do, we show this modal to let the user
  // choose: generate only for missing, or override all.
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [leadsWithMessages, setLeadsWithMessages] = useState(0)
  const [leadsWithoutMessages, setLeadsWithoutMessages] = useState(0)

  const handleExport = () => {
    const csv = exportLeadsToCsv(leads, engineType || undefined)
    downloadCsv(csv, `bad-decision-leads-${Date.now()}.csv`)
  }

  const handleExportWhatsApp = () => {
    const whatsappLeads = leads.filter(l => l.is_whatsapp)
    if (whatsappLeads.length === 0) return
    const csv = whatsappLeads.map(l => {
      const phone = (l.phone || '').replace(/[^\d+]/g, '')
      const waPhone = phone.startsWith('+') ? phone.substring(1) : phone
      return [
        l.company_name || '',
        l.phone || '',
        'Yes',
        l.is_telegram ? 'Yes' : 'No',
        `https://wa.me/${waPhone}`,
        '',
        '',
        l.category || '',
      ].map(f => f.includes(',') || f.includes('"') ? `"${f.replace(/"/g, '""')}"` : f).join(',')
    }).join('\n')
    const header = 'Company Name,Phone,WhatsApp,Telegram,WhatsApp Link,Telegram Link,Country,Industry'
    downloadCsv(`${header}\n${csv}`, `whatsapp-leads-${Date.now()}.csv`)
  }

  const handleExportTelegram = () => {
    const telegramLeads = leads.filter(l => l.is_telegram)
    if (telegramLeads.length === 0) return
    const csv = telegramLeads.map(l => {
      const phone = (l.phone || '').replace(/[^\d+]/g, '')
      const tgPhone = phone.startsWith('+') ? phone.substring(1) : phone
      return [
        l.company_name || '',
        l.phone || '',
        l.is_whatsapp ? 'Yes' : 'No',
        'Yes',
        l.is_whatsapp ? `https://wa.me/${phone.replace('+', '')}` : '',
        `https://t.me/+${tgPhone}`,
        '',
        l.category || '',
      ].map(f => f.includes(',') || f.includes('"') ? `"${f.replace(/"/g, '""')}"` : f).join(',')
    }).join('\n')
    const header = 'Company Name,Phone,WhatsApp,Telegram,WhatsApp Link,Telegram Link,Country,Industry'
    downloadCsv(`${header}\n${csv}`, `telegram-leads-${Date.now()}.csv`)
  }

  // Count how many leads already have outreach messages.
  // A lead "has messages" if outreach_email is set and not 'ABSENT'.
  const countLeadsWithMessages = useCallback(() => {
    const withMsg = leads.filter(l =>
      l.outreach_email && l.outreach_email !== 'ABSENT'
    ).length
    const withoutMsg = leads.length - withMsg
    return { withMsg, withoutMsg }
  }, [leads])

  // When the user clicks "Write Messages for All", decide whether to show
  // the modal (some leads have messages) or proceed directly (no leads have messages).
  const handleBatchOutreachClick = () => {
    if (!taskId || leads.length === 0) return
    const { withMsg, withoutMsg } = countLeadsWithMessages()
    setLeadsWithMessages(withMsg)
    setLeadsWithoutMessages(withoutMsg)

    if (withMsg === 0) {
      // No leads have messages yet — proceed directly, generate for all.
      runBatchGeneration(false)
    } else {
      // Some leads have messages — show the modal so the user can choose.
      setShowBatchModal(true)
    }
  }

  // The actual API call. forceRegenerate=false skips leads with existing messages.
  // forceRegenerate=true overrides all.
  const runBatchGeneration = async (forceRegenerate: boolean) => {
    if (!taskId) return
    setShowBatchModal(false)
    setBatchLoading(true)
    setBatchResult('')
    try {
      const res = await fetch('/api/backend/outreach-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, force_regenerate: forceRegenerate }),
      })
      // Handle non-JSON responses gracefully
      const responseText = await res.text()
      let data: any
      try {
        data = JSON.parse(responseText)
      } catch {
        data = { error: responseText.slice(0, 200) || `Server error (${res.status})` }
      }
      if (res.ok) {
        setBatchResult(data.message || `Done! Generated messages for ${data.generated} out of ${data.total_leads} leads.`)
        onLeadsUpdated?.()
      } else {
        setBatchResult(data.detail || data.error || `Failed to generate messages (${res.status}).`)
      }
    } catch (err: any) {
      // Handle Vercel FUNCTION_INVOCATION_TIMEOUT — the batch is likely still
      // processing on the backend even though the frontend proxy timed out.
      const errMsg = err.message || ''
      if (errMsg.includes('TIMEOUT') || errMsg.includes('Failed to fetch') || errMsg.includes('network')) {
        setBatchResult('The server is still generating messages in the background. Please wait 1-2 minutes, then refresh the page to see them.')
      } else {
        setBatchResult(errMsg || 'Something went wrong. Check your connection and try again.')
      }
    } finally {
      setBatchLoading(false)
    }
  }

  const sortedLeads = useMemo(() => {
    if (!leads) return []
    const arr = [...leads]
    if (sortBy === 'rating') {
      arr.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
    } else if (sortBy === 'name') {
      arr.sort((a, b) => {
        const nameA = (a.company_name || a.author_username || '').toLowerCase()
        const nameB = (b.company_name || b.author_username || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
    } else if (sortBy === 'email') {
      const has = (l: Lead) => l.verified_email && l.verified_email !== 'ABSENT' ? 1 : 0
      arr.sort((a, b) => has(b) - has(a))
    } else if (sortBy === 'phone') {
      const has = (l: Lead) => l.phone && l.phone !== 'ABSENT' ? 1 : 0
      arr.sort((a, b) => has(b) - has(a))
    } else if (sortBy === 'platform') {
      const plat = (l: Lead) => (l.ad_platform || l.platform || '').toLowerCase()
      arr.sort((a, b) => plat(a).localeCompare(plat(b)))
    } else if (sortBy === 'intent') {
      const levelMap: Record<string, number> = { high: 3, medium: 2, low: 1 }
      const lvl = (l: Lead) => levelMap[(l.intent_level || '').toLowerCase()] || 0
      arr.sort((a, b) => lvl(b) - lvl(a))
    }
    return arr
  }, [leads, sortBy])

  const renderExportBtn = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border hover:border-primary/50 text-card-foreground text-[13px] font-semibold transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export CSV
      </button>
      {isPro && leads.some(l => l.is_whatsapp) && (
        <button
          onClick={handleExportWhatsApp}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-[13px] font-semibold transition-colors hover:bg-[#25D366]/20"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp CSV
        </button>
      )}
      {isPro && leads.some(l => l.is_telegram) && (
        <button
          onClick={handleExportTelegram}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] text-[13px] font-semibold transition-colors hover:bg-[#0088cc]/20"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.329-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Telegram CSV
        </button>
      )}
    </div>
  )

  const renderBatchBtn = () => {
    if (!taskId) return null
    return (
      <button
        onClick={handleBatchOutreachClick}
        disabled={batchLoading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground text-[14px] font-bold transition-colors disabled:opacity-50 shadow-sm"
      >
        {batchLoading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Writing messages...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Write Messages for All
          </>
        )}
      </button>
    )
  }

  // Smart modal: shown when some leads already have outreach messages.
  // Lets the user choose between generating only for missing leads or
  // overriding all existing messages.
  const renderBatchModal = () => {
    if (!showBatchModal) return null
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowBatchModal(false)}
      >
        <div
          className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground">Write Messages for All</h3>
              <p className="text-[14px] text-foreground/80 mt-1">
                {leadsWithMessages} {leadsWithMessages === 1 ? 'lead already has' : 'leads already have'} outreach messages.
                {leadsWithoutMessages > 0 && ` ${leadsWithoutMessages} ${leadsWithoutMessages === 1 ? 'lead does' : 'leads do'} not.`}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {leadsWithoutMessages > 0 && (
              <button
                onClick={() => runBatchGeneration(false)}
                disabled={batchLoading}
                className="w-full text-left p-4 rounded-xl border-2 border-primary bg-primary/10 hover:bg-primary/20 hover:border-primary transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-foreground">
                      Generate for {leadsWithoutMessages} {leadsWithoutMessages === 1 ? 'lead' : 'leads'} without messages
                    </p>
                    <p className="text-[13px] text-foreground/70 mt-0.5">
                      Keeps the {leadsWithMessages} existing {leadsWithMessages === 1 ? 'message' : 'messages'} unchanged.
                    </p>
                  </div>
                </div>
              </button>
            )}

            <button
              onClick={() => runBatchGeneration(true)}
              disabled={batchLoading}
              className="w-full text-left p-4 rounded-xl border-2 border-warning/40 bg-warning/10 hover:bg-warning/20 hover:border-warning transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-warning flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-foreground">
                    Regenerate for ALL {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
                  </p>
                  <p className="text-[13px] text-foreground/70 mt-0.5">
                    Overrides the {leadsWithMessages} existing {leadsWithMessages === 1 ? 'message' : 'messages'} with fresh versions.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={() => setShowBatchModal(false)}
            disabled={batchLoading}
            className="w-full text-center text-[14px] font-bold text-foreground/60 hover:text-foreground transition-colors py-2.5 border-t border-border"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const renderBatchResult = () => {
    if (!batchResult) return null
    return <span className="text-[12px] text-muted-foreground">{batchResult}</span>
  }

  const renderSortBtn = (value: string, label: string) => (
    <button
      onClick={() => setSortBy(sortBy === value ? 'default' : value)}
      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border ${
        sortBy === value
          ? 'bg-primary text-white border-primary'
          : 'bg-card text-card-foreground border-border hover:border-primary/50'
      }`}
    >
      {label}
    </button>
  )

  const renderSortBar = (options: Array<{ value: string, label: string }>) => (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[12px] text-muted-foreground">Sort by:</span>
      {options.map(opt => (
        <span key={opt.value}>{renderSortBtn(opt.value, opt.label)}</span>
      ))}
    </div>
  )

  const renderSocialLinks = (lead: Lead) => {
    const links: Array<{ label: string, href: string }> = []
    if (lead.linkedin && lead.linkedin !== 'ABSENT') {
      links.push({ label: 'LinkedIn', href: lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}` })
    }
    if (lead.instagram && lead.instagram !== 'ABSENT') {
      links.push({ label: 'Instagram', href: lead.instagram.startsWith('http') ? lead.instagram : `https://${lead.instagram}` })
    }
    if (lead.facebook && lead.facebook !== 'ABSENT') {
      links.push({ label: 'Facebook', href: lead.facebook.startsWith('http') ? lead.facebook : `https://${lead.facebook}` })
    }
    if (links.length === 0) return null
    return (
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
        {links.map(l => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-primary hover:text-primary/80 transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
    )
  }

  // ---------- Ad platform badge (ads_intent) ----------
  const renderAdPlatformBadge = (platform?: string | null) => {
    if (!platform) return null
    const p = platform.toLowerCase()
    let label = platform
    let bgClass = 'bg-muted text-foreground'
    if (p.includes('facebook') || p === 'fb') {
      label = 'Facebook'
      bgClass = 'bg-[#1877F2] text-white'
    } else if (p.includes('google')) {
      label = 'Google'
      bgClass = 'bg-[#4285F4] text-white'
    } else if (p.includes('tiktok')) {
      label = 'TikTok'
      bgClass = 'bg-black text-white'
    } else if (p.includes('instagram') || p === 'insta') {
      label = 'Instagram'
      bgClass = 'bg-[#E1306C] text-white'
    }
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shrink-0 ${bgClass}`}>
        {label}
      </span>
    )
  }

  // ---------- Aggregator source badge (web_absent) ----------
  const renderAggregatorBadge = (source?: string | null) => {
    if (!source) return null
    const s = source.toLowerCase()
    let label = source
    let bgClass = 'bg-muted text-foreground'
    if (s.includes('yelp')) {
      label = 'Yelp'
      bgClass = 'bg-[#D32323] text-white'
    } else if (s.includes('houzz')) {
      label = 'Houzz'
      bgClass = 'bg-[#4DBC15] text-white'
    } else if (s.includes('etsy')) {
      label = 'Etsy'
      bgClass = 'bg-[#F1641E] text-white'
    } else if (s.includes('yellow')) {
      label = 'Yellow Pages'
      bgClass = 'bg-[#FFD400] text-black'
    } else if (s.includes('google')) {
      label = 'Google Maps'
      bgClass = 'bg-[#4285F4] text-white'
    } else if (s.includes('tripadvisor')) {
      label = 'TripAdvisor'
      bgClass = 'bg-[#34E0A1] text-black'
    }
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${bgClass}`}>
        {label}
      </span>
    )
  }

  // ---------- Social platform badge (social_intent) ----------
  const renderSocialPlatformBadge = (platform?: string | null) => {
    if (!platform) return null
    const p = platform.toLowerCase()
    let label = platform
    let bgClass = 'bg-muted text-foreground'
    if (p.includes('reddit')) {
      label = 'Reddit'
      bgClass = 'bg-[#FF4500] text-white'
    } else if (p.includes('twitter') || p.includes('x.com')) {
      label = 'Twitter / X'
      bgClass = 'bg-black text-white'
    } else if (p.includes('facebook') || p === 'fb') {
      label = 'Facebook'
      bgClass = 'bg-[#1877F2] text-white'
    } else if (p.includes('linkedin')) {
      label = 'LinkedIn'
      bgClass = 'bg-[#0A66C2] text-white'
    }
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shrink-0 ${bgClass}`}>
        {label}
      </span>
    )
  }

  const intentBadgeClass = (level?: string | null) => {
    const l = (level || '').toLowerCase()
    if (l === 'high') return 'bg-danger-soft text-danger'
    if (l === 'medium') return 'bg-warning-soft text-warning'
    return 'bg-muted text-muted-foreground'
  }

  const normalizeUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`)
  const cleanUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  // ============================================================
  // SHARED LEAD CARD — clean single-column style matching the
  // reference design. Each card has:
  //   Row 1: bold company name + verified badge + rating + engine badge
  //   Row 2: blue website link (primary)
  //   Row 3: contact row — email . phone (with WhatsApp/Telegram icons)
  //   Row 4: engine-specific details (address, ad platform, etc.)
  //   Row 5: outreach messages accordion
  // ============================================================
  const WhatsAppIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
  const TelegramIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.329-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )

  // ---------- Verified badge ----------
  const VerifiedBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success-soft text-success text-[10px] font-bold uppercase tracking-wide shrink-0">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      Verified
    </span>
  )

  // ---------- Rating display ----------
  const RatingDisplay = ({ rating, reviewCount }: { rating?: number | null, reviewCount?: number | null }) => {
    if (rating == null || Number(rating) <= 0) return null
    return (
      <div className="flex items-center gap-1 text-[13px] font-bold text-foreground shrink-0">
        <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {Number(rating).toFixed(1)}
        {reviewCount != null && Number(reviewCount) > 0 && (
          <span className="text-[11px] font-normal text-muted-foreground ml-0.5">
            ({Number(reviewCount).toLocaleString()})
          </span>
        )}
      </div>
    )
  }

  // ---------- Contact row - email + phone with WhatsApp/Telegram icons ----------
  const ContactRow = ({ lead }: { lead: Lead }) => {
    const hasEmail = lead.verified_email && lead.verified_email !== 'ABSENT'
    const hasPhone = lead.phone && lead.phone !== 'ABSENT'
    if (!hasEmail && !hasPhone) return null
    return (
      <div className="flex items-center gap-3 flex-wrap text-[13px]">
        {hasEmail && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-foreground truncate max-w-[260px]">{lead.verified_email}</span>
          </div>
        )}
        {hasPhone && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${lead.phone}`} className="text-foreground hover:text-primary transition-colors">{lead.phone}</a>
            {showMessaging && lead.is_whatsapp && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#25D366]/15 border border-[#25D366]/30" title="On WhatsApp">
                <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
              </span>
            )}
            {showMessaging && lead.is_telegram && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0088cc]/15 border border-[#0088cc]/30" title="On Telegram">
                <TelegramIcon className="w-3 h-3 text-[#0088cc]" />
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  // ---------- Website link (primary visual element) ----------
  const WebsiteLink = ({ url }: { url: string }) => {
    if (!url || url === 'ABSENT') return null
    return (
      <a
        href={normalizeUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[14px] text-primary hover:text-primary/80 transition-colors truncate"
      >
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        {cleanUrl(url)}
      </a>
    )
  }

  // ---------- Engine-specific details row ----------
  const EngineDetails = ({ lead, engine }: { lead: Lead, engine: EngineType | null }) => {
    const items: Array<{ label: string, value: string }> = []

    if (engine === 'smb_maps' || engine === 'companies') {
      // Companies engine: address, category, rating, reviews
      if (lead.address && lead.address !== 'ABSENT') items.push({ label: 'Address', value: lead.address })
      if (lead.category && lead.category !== 'ABSENT') items.push({ label: 'Category', value: lead.category })
      if (lead.rating != null && Number(lead.rating) > 0) items.push({ label: 'Rating', value: `${Number(lead.rating).toFixed(1)} ★` })
      if (lead.review_count != null && Number(lead.review_count) > 0) items.push({ label: 'Reviews', value: Number(lead.review_count).toLocaleString() })
    } else if (engine === 'ads_intent' || engine === 'ads_running') {
      // Ads engine: platform, status, spend
      if (lead.ad_platform && lead.ad_platform !== 'ABSENT') items.push({ label: 'Platform', value: lead.ad_platform })
      if (lead.ad_status && lead.ad_status !== 'ABSENT') items.push({ label: 'Status', value: lead.ad_status })
      if (lead.estimated_monthly_ad_spend && lead.estimated_monthly_ad_spend !== 'ABSENT') items.push({ label: 'Est. Spend', value: lead.estimated_monthly_ad_spend })
      if (lead.ad_start_date && lead.ad_start_date !== 'ABSENT') items.push({ label: 'Since', value: lead.ad_start_date })
    } else if (engine === 'ecommerce' || engine === 'web_absent') {
      // Ecommerce engine: platform, products, price, revenue, tech stack, store age
      if (lead.ecommerce_platform && lead.ecommerce_platform !== 'ABSENT') items.push({ label: 'Platform', value: lead.ecommerce_platform })
      if (lead.product_count != null && Number(lead.product_count) > 0) items.push({ label: 'Products', value: Number(lead.product_count).toLocaleString() })
      if (lead.average_price && lead.average_price !== 'ABSENT') items.push({ label: 'Avg Price', value: lead.average_price })
      if (lead.price_range && lead.price_range !== 'ABSENT') items.push({ label: 'Price Range', value: lead.price_range })
      if (lead.store_currency && lead.store_currency !== 'ABSENT') items.push({ label: 'Currency', value: lead.store_currency })
      if (lead.estimated_revenue && lead.estimated_revenue !== 'ABSENT') items.push({ label: 'Est. Revenue', value: lead.estimated_revenue })
      if (lead.store_age_days != null && Number(lead.store_age_days) > 0) {
        const years = Math.floor(Number(lead.store_age_days) / 365)
        const months = Math.floor((Number(lead.store_age_days) % 365) / 30)
        const ageStr = years > 0 ? `${years}y ${months}m` : `${months}m`
        items.push({ label: 'Store Age', value: ageStr })
      }
      // Tech stack badges
      if (lead.uses_email_marketing === true) items.push({ label: 'Email Marketing', value: 'Yes' })
      if (lead.uses_ad_tracking === true) items.push({ label: 'Ad Tracking', value: 'Yes' })
      if (lead.uses_subscriptions === true) items.push({ label: 'Subscriptions', value: 'Yes' })
      if (lead.tech_stack && Array.isArray(lead.tech_stack) && lead.tech_stack.length > 0) {
        items.push({ label: 'Tech Stack', value: lead.tech_stack.join(', ') })
      }
      if (lead.product_categories && Array.isArray(lead.product_categories) && lead.product_categories.length > 0) {
        items.push({ label: 'Categories', value: lead.product_categories.slice(0, 3).join(', ') })
      }
      // For web_absent (old engine name) show aggregator info
      if (lead.aggregator_source && lead.aggregator_source !== 'ABSENT') items.push({ label: 'Found On', value: lead.aggregator_source })
      if (lead.aggregator_rating != null && Number(lead.aggregator_rating) > 0) items.push({ label: 'Rating', value: `${Number(lead.aggregator_rating).toFixed(1)} ★` })
    }

    if (items.length === 0) return null
    return (
      <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap text-[12px] text-muted-foreground">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <span className="font-semibold uppercase tracking-wide text-[10px] text-muted-foreground/80">{item.label}</span>
            <span className="text-foreground font-medium">{item.value}</span>
          </span>
        ))}
      </div>
    )
  }

  // ---------- Ecommerce platform badge ----------
  const renderEcommercePlatformBadge = (platform?: string | null) => {
    if (!platform || platform === 'ABSENT') return null
    const p = platform.toLowerCase()
    let bgClass = 'bg-muted text-foreground'
    let label = platform
    if (p.includes('shopify')) {
      label = 'Shopify'
      bgClass = 'bg-[#95BF47] text-white'
    } else if (p.includes('woocommerce')) {
      label = 'WooCommerce'
      bgClass = 'bg-[#7F54B3] text-white'
    } else if (p.includes('bigcommerce')) {
      label = 'BigCommerce'
      bgClass = 'bg-[#0D5FF5] text-white'
    } else if (p.includes('magento')) {
      label = 'Magento'
      bgClass = 'bg-[#EE672F] text-white'
    } else if (p.includes('squarespace')) {
      label = 'Squarespace'
      bgClass = 'bg-black text-white'
    } else if (p.includes('wix')) {
      label = 'Wix'
      bgClass = 'bg-black text-white'
    }
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shrink-0 ${bgClass}`}>
        {label}
      </span>
    )
  }

  // ---------- Shared LeadCard component ----------
  const LeadCard = ({ lead, engine, onLeadsUpdated }: { lead: Lead, engine: EngineType | null, onLeadsUpdated?: () => void }) => (
    <div className="card-premium p-5 space-y-2.5">
      {/* Row 1: company name + badges */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h3 className="font-bold text-[16px] text-foreground truncate flex-1 min-w-0">
          {lead.company_name || lead.author_username || 'Unknown'}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {lead.validation_gates_passed && lead.validation_gates_passed >= 2 && <VerifiedBadge />}
          <RatingDisplay rating={lead.rating} reviewCount={lead.review_count} />
          {engine === 'ads_intent' || engine === 'ads_running'
            ? renderAdPlatformBadge(lead.ad_platform)
            : engine === 'ecommerce' || engine === 'web_absent'
            ? renderEcommercePlatformBadge(lead.ecommerce_platform)
            : (engine as string) === 'social_intent'
            ? renderSocialPlatformBadge(lead.platform)
            : null}
        </div>
      </div>

      {/* Row 2: website link */}
      <WebsiteLink url={lead.website_url || ''} />

      {/* Row 3: contact row */}
      <ContactRow lead={lead} />

      {/* Row 4: engine-specific details */}
      <EngineDetails lead={lead} engine={engine} />

      {/* Row 5: social links */}
      {renderSocialLinks(lead)}

      {/* Row 6: outreach messages */}
      <OutreachMessages lead={lead} onLeadsUpdated={onLeadsUpdated} />
    </div>
  )

  // ============================================================
  // SMB_MAPS / COMPANIES - Local Businesses (single-column list)
  // ============================================================
  if (engineType === 'smb_maps' || engineType === 'companies') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {leads.length} verified {leads.length === 1 ? 'lead' : 'leads'} found
            </h2>
            <p className="text-[13px] text-muted-foreground">Every email has been tested. Send your pitch with confidence.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {renderExportBtn()}
            {renderBatchBtn()}
            {renderBatchResult()}
            {renderBatchModal()}
          </div>
        </div>
        {renderSortBar([
          { value: 'rating', label: 'Rating' },
          { value: 'name', label: 'Name (A-Z)' },
          { value: 'email', label: 'Has Email' },
        ])}
        <div className="space-y-3">
          {sortedLeads.map((lead, i) => (
            <LeadCard key={i} lead={lead} engine={engineType} onLeadsUpdated={onLeadsUpdated} />
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // ADS_RUNNING / ADS_INTENT - Ads Intelligence
  // ============================================================
  if (engineType === 'ads_intent' || engineType === 'ads_running') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {leads.length} {leads.length === 1 ? 'business' : 'businesses'} running ads found
            </h2>
            <p className="text-[13px] text-muted-foreground">Companies actively spending on ads right now.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {renderExportBtn()}
            {renderBatchBtn()}
            {renderBatchResult()}
            {renderBatchModal()}
          </div>
        </div>
        {renderSortBar([
          { value: 'platform', label: 'Platform' },
          { value: 'name', label: 'Name (A-Z)' },
          { value: 'email', label: 'Has Email' },
        ])}
        <div className="space-y-3">
          {sortedLeads.map((lead, i) => (
            <LeadCard key={i} lead={lead} engine={engineType} onLeadsUpdated={onLeadsUpdated} />
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // WEB_ABSENT / ECOMMERCE - Businesses on aggregators
  // ============================================================
  if (engineType === 'web_absent' || engineType === 'ecommerce') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {leads.length} {leads.length === 1 ? 'business' : 'businesses'} that need a website found
            </h2>
            <p className="text-[13px] text-muted-foreground">Listed on aggregators but missing a website - easy wins.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {renderExportBtn()}
            {renderBatchBtn()}
            {renderBatchResult()}
            {renderBatchModal()}
          </div>
        </div>
        {renderSortBar([
          { value: 'rating', label: 'Rating' },
          { value: 'name', label: 'Name (A-Z)' },
          { value: 'phone', label: 'Has Phone' },
        ])}
        <div className="space-y-3">
          {sortedLeads.map((lead, i) => (
            <LeadCard key={i} lead={lead} engine={engineType} onLeadsUpdated={onLeadsUpdated} />
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // SOCIAL_INTENT - Social Radar
  // ============================================================
  if ((engineType as unknown as string) === 'social_intent') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {leads.length} {leads.length === 1 ? 'person' : 'people'} looking for help found
            </h2>
            <p className="text-[13px] text-muted-foreground">Real people posting about problems you can solve.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {renderExportBtn()}
            {renderBatchBtn()}
            {renderBatchResult()}
            {renderBatchModal()}
          </div>
        </div>
        {renderSortBar([
          { value: 'intent', label: 'Intent Level' },
          { value: 'platform', label: 'Platform' },
        ])}
        <div className="space-y-3">
          {sortedLeads.map((lead, i) => (
            <LeadCard key={i} lead={lead} engine={engineType} onLeadsUpdated={onLeadsUpdated} />
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // FALLBACK — generic layout when engine is unknown
  // ============================================================
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {leads.length} verified {leads.length === 1 ? 'lead' : 'leads'} found
          </h2>
          <p className="text-[13px] text-muted-foreground">Every email has been tested. Send your pitch with confidence.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {renderExportBtn()}
          {renderBatchBtn()}
          {renderBatchResult()}
          {renderBatchModal()}
        </div>
      </div>
      <div className="space-y-3">
        {sortedLeads.map((lead, i) => (
          <LeadCard key={i} lead={lead} engine={engineType} onLeadsUpdated={onLeadsUpdated} />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// COLLECTIONS VIEW — grouped by engine type
// ============================================================
const ENGINE_META: Record<EngineType, { name: string; iconPath: string }> = {
  companies: {
    name: 'Companies And Professionals',
    iconPath: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  ads_running: {
    name: 'Businesses Running Ads',
    iconPath: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  },
  ecommerce: {
    name: 'Ecommerce Brands',
    iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  },
  // Backward compatibility (old engine names)
  smb_maps: {
    name: 'Companies And Professionals',
    iconPath: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  ads_intent: {
    name: 'Businesses Running Ads',
    iconPath: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  },
  web_absent: {
    name: 'Ecommerce Brands',
    iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  },
}

const ENGINE_ORDER: EngineType[] = ['companies', 'ads_running', 'ecommerce', 'smb_maps', 'ads_intent', 'web_absent']

function CollectionsView({ collections }: { collections: SmartCollection[] }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  // Detail-view state — when a collection is clicked we fetch its leads and
  // render them via the same ResultsView component used for fresh searches.
  const [selectedCollection, setSelectedCollection] = useState<SmartCollection | null>(null)
  const [detailLeads, setDetailLeads] = useState<Lead[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const grouped = useMemo(() => {
    const groups: Record<EngineType, SmartCollection[]> = {
      companies: [],
      ads_running: [],
      ecommerce: [],
      smb_maps: [],
      ads_intent: [],
      web_absent: [],
    }
    collections.forEach(col => {
      if (col && groups[col.task_type]) {
        groups[col.task_type].push(col)
      }
    })
    return groups
  }, [collections])

  const toggle = (engine: EngineType) => {
    setCollapsed(prev => ({ ...prev, [engine]: !prev[engine] }))
  }

  // Fetch leads for a collection's task_id from our backend proxy.
  // Backend endpoint: GET /api/leads/{task_id} — proxied at /api/backend/leads?task_id=xxx
  const handleViewCollection = useCallback(async (col: SmartCollection) => {
    setSelectedCollection(col)
    setDetailLeads([])
    setDetailError('')
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/backend/leads?task_id=${encodeURIComponent(col.task_id || col.id)}`, {
        method: 'GET',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || data?.detail || `Failed to load leads (${res.status})`)
      }
      setDetailLeads(Array.isArray(data.leads) ? data.leads : [])
    } catch (err: any) {
      console.error('[Collections] Failed to load leads:', err)
      setDetailError(err.message || 'Failed to load leads. Please try again.')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const handleBackToList = () => {
    setSelectedCollection(null)
    setDetailLeads([])
    setDetailError('')
  }

  // Re-fetch leads for the currently-open collection. Used after batch outreach
  // generation so each lead card flips from "Write Outreach Messages" to showing
  // the freshly-saved messages without requiring a manual reload.
  const reloadDetailLeads = useCallback(async () => {
    if (!selectedCollection) return
    try {
      const res = await fetch(`/api/backend/leads?task_id=${encodeURIComponent(selectedCollection.task_id || selectedCollection.id)}`, {
        method: 'GET',
      })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.leads)) {
        setDetailLeads(data.leads)
      }
    } catch (err) {
      console.warn('[Collections] Failed to reload leads after batch outreach:', err)
    }
  }, [selectedCollection])

  // ============================================================
  // DETAIL VIEW — reuse ResultsView to render a collection's leads
  // ============================================================
  if (selectedCollection) {
    const meta = ENGINE_META[selectedCollection.task_type] || ENGINE_META.ads_intent
    return (
      <div className="space-y-5">
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Collections
        </button>

        <div className="card-premium p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={meta.iconPath} />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{selectedCollection.name}</h1>
              <p className="text-[12px] text-muted-foreground">
                {meta.name} · {selectedCollection.created_at} · {selectedCollection.lead_count} {selectedCollection.lead_count === 1 ? 'lead' : 'leads'}
              </p>
            </div>
          </div>
        </div>

        {detailLoading && (
          <LeadsSkeleton count={6} />
        )}

        {!detailLoading && detailError && (
          <div className="card-premium p-8 text-center border-destructive/20">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
              <svg className="w-7 h-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Could not load leads.</h3>
            <p className="text-[14px] text-muted-foreground mb-4">{detailError}</p>
            <button
              onClick={() => handleViewCollection(selectedCollection)}
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[14px] font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!detailLoading && !detailError && detailLeads.length === 0 && (
          <div className="card-premium p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted border border-border mb-4">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No leads in this collection.</h3>
            <p className="text-[14px] text-muted-foreground">The search may have completed without storing leads. Try running a new search.</p>
          </div>
        )}

        {!detailLoading && !detailError && detailLeads.length > 0 && (
          <ResultsView leads={detailLeads} engineType={selectedCollection.task_type} taskId={selectedCollection.task_id || selectedCollection.id} onLeadsUpdated={reloadDetailLeads} />
        )}
      </div>
    )
  }

  // ============================================================
  // LIST VIEW — grouped by engine, each collection clickable
  // ============================================================
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Your Collections</h1>
        <p className="text-[14px] text-muted-foreground">Every search you run gets saved here. Click any collection to view its leads.</p>
      </div>

      {collections.length === 0 ? (
        <div className="card-premium p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted border border-border mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No collections yet.</h3>
          <p className="text-[14px] text-muted-foreground max-w-sm mx-auto">
            Run a search and your results will be saved here automatically. Come back anytime to review your leads.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ENGINE_ORDER.map(engine => {
            const cols = grouped[engine]
            if (!cols || cols.length === 0) return null
            const totalLeads = cols.reduce((sum, c) => sum + (c.lead_count || 0), 0)
            const isCollapsed = collapsed[engine] === true
            const meta = ENGINE_META[engine]
            return (
              <div key={engine} className="card-premium p-4 sm:p-5">
                <button
                  onClick={() => toggle(engine)}
                  className="flex items-center justify-between w-full text-left gap-3"
                  aria-expanded={!isCollapsed}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={meta.iconPath} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[16px] text-foreground truncate">{meta.name}</h3>
                      <p className="text-[12px] text-muted-foreground">
                        {totalLeads.toLocaleString()} {totalLeads === 1 ? 'lead' : 'leads'} · {cols.length} {cols.length === 1 ? 'collection' : 'collections'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${isCollapsed ? '' : 'rotate-180'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {!isCollapsed && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cols.map(col => (
                      <button
                        key={col.id}
                        onClick={() => handleViewCollection(col)}
                        className="text-left rounded-lg border border-border-light p-3 bg-muted/30 hover:bg-muted/60 hover:border-primary/40 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-[11px] text-muted-foreground truncate">{col.created_at}</span>
                          <span className="text-[12px] font-bold text-primary shrink-0">{col.lead_count} {col.lead_count === 1 ? 'lead' : 'leads'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-[14px] text-foreground truncate flex-1">{col.name}</h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            View
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================
// CREDITS VIEW
// ============================================================
function CreditsView({
  creditBalance, tier, onBuyCredits, paymentProcessing, paymentError, userCountry
}: {
  creditBalance: { credits_balance: number; credits_reserved: number; total_purchased: number }
  tier: string
  onBuyCredits: (addon: any) => void
  paymentProcessing: boolean
  paymentError: string
  userCountry: string
}) {
  // Free users cannot buy credit add-ons — they must upgrade to a paid plan first.
  // Paid users (starter/growth/pro) see the buy buttons normally.
  const isFreeTier = tier === 'free'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Credit Vault</h1>
        <p className="text-[14px] text-muted-foreground">Your credit balance and purchase history. Buy more credits anytime.</p>
      </div>

      {/* Balance Card */}
      <div className="card-premium p-6 bg-card border-primary/20">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] text-card-foreground/70 uppercase tracking-wide mb-1">Available</div>
            <div className="text-3xl font-bold text-card-foreground">{creditBalance.credits_balance}</div>
          </div>
          <div>
            <div className="text-[11px] text-card-foreground/70 uppercase tracking-wide mb-1">Reserved</div>
            <div className="text-3xl font-bold text-card-foreground/70">{creditBalance.credits_reserved}</div>
          </div>
          <div>
            <div className="text-[11px] text-card-foreground/70 uppercase tracking-wide mb-1">Lifetime</div>
            <div className="text-3xl font-bold text-card-foreground/70">{creditBalance.total_purchased}</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[12px] text-card-foreground/60">Current plan: </span>
            <span className="text-[12px] text-primary font-semibold uppercase">{tier}</span>
          </div>
          <span className="text-[12px] text-card-foreground/60">
            Currency: <span className="text-card-foreground font-semibold">{userCountry === 'NG' ? 'Nigerian Naira' : 'US Dollar'}</span>
          </span>
        </div>
      </div>

      {/* Error */}
      {paymentError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-[14px] text-destructive">{paymentError}</p>
        </div>
      )}

      {/* Free-tier gate — block credit purchases until the user upgrades */}
      {isFreeTier && (
        <div className="rounded-xl bg-warning/10 border border-warning/30 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 mb-1.5 justify-center sm:justify-start">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-[16px] font-bold text-warning">Paid plan required to buy credits</h3>
            </div>
            <p className="text-[13px] text-muted-foreground max-w-md">
              You need a paid plan to buy credits. Upgrade to unlock credit purchases and all four search engines.
            </p>
          </div>
          <a
            href="/pricing#pricing-table"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-[14px] font-bold transition-all shadow-lg shadow-primary/30 whitespace-nowrap"
          >
            Upgrade Now
          </a>
        </div>
      )}

      {/* Buy Credits — hidden for free users (they must upgrade first) */}
      {!isFreeTier && (
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3">Buy More Credits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CREDIT_ADDONS.map(addon => (
              <div key={addon.id} className="card-premium p-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gradient-violet">{addon.credits.toLocaleString()}</div>
                <div className="text-[12px] text-muted-foreground mb-3">credits</div>
                <div className="text-lg font-bold text-foreground mb-4">
                  {formatAddonPrice(addon, userCountry)}
                </div>
                <button
                  onClick={() => onBuyCredits(addon)}
                  disabled={paymentProcessing}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
                >
                  {paymentProcessing ? 'Please wait...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade Plan — always visible; for free users this is the primary CTA */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">{isFreeTier ? 'Upgrade Your Plan' : 'Or Upgrade Your Plan'}</h2>
        <div className="card-premium p-5">
          <p className="text-[14px] text-muted-foreground mb-4">
            {isFreeTier
              ? 'Plans give you credits every month, access to all four search engines, and the ability to buy more credits whenever you need them.'
              : 'Plans give you credits every month at a better price. Plus more search engines and higher daily limits.'}
          </p>
          <a
            href="/pricing#pricing-table"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-card border border-border hover:border-primary/50 text-card-foreground text-[14px] font-semibold transition-colors"
          >
            View Plans
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// BILLING VIEW — subscription management + transaction history
// ============================================================
function BillingView({ tier, onTierChange }: { tier: string; onTierChange: () => void }) {
  const [subscription, setSubscription] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [subRes, histRes] = await Promise.all([
        fetch('/api/backend/subscriptions/status'),
        fetch('/api/backend/billing/history'),
      ])
      if (subRes.ok) {
        const subData = await subRes.json()
        setSubscription(subData.subscription)
      }
      if (histRes.ok) {
        const histData = await histRes.json()
        setTransactions(histData.transactions || [])
      }
    } catch (err: any) {
      setError('Could not load billing information.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCancel = async () => {
    setCanceling(true)
    setError('')
    try {
      const res = await fetch('/api/backend/subscriptions/cancel', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSuccessMsg(data.message || 'Subscription canceled.')
        setShowCancelModal(false)
        setSubscription(null)
        onTierChange()
      } else {
        setError(data.error || data.detail || 'Could not cancel subscription.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <BillingViewSkeleton />
    )
  }

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Billing</h1>
        <p className="text-[14px] text-muted-foreground">Manage your subscription and view payment history.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-[14px] text-destructive">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl bg-success/10 border border-success/20 p-4">
          <p className="text-[14px] text-success">{successMsg}</p>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="card-premium p-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Current Plan</div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground capitalize">{tier}</span>
              {subscription?.status === 'active' && (
                <span className="px-2 py-0.5 rounded-md bg-success/15 text-success text-[11px] font-bold uppercase">Active</span>
              )}
              {subscription?.status === 'trialing' && (
                <span className="px-2 py-0.5 rounded-md bg-warning/15 text-warning text-[11px] font-bold uppercase">Pending</span>
              )}
              {subscription?.status === 'canceled' && (
                <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-bold uppercase">Canceled</span>
              )}
              {subscription?.status === 'past_due' && (
                <span className="px-2 py-0.5 rounded-md bg-destructive/15 text-destructive text-[11px] font-bold uppercase">Past Due</span>
              )}
            </div>
            {renewalDate && subscription?.status === 'active' && (
              <p className="text-[13px] text-muted-foreground mt-1">Next billing date: {renewalDate}</p>
            )}
            {tier === 'free' && (
              <p className="text-[13px] text-muted-foreground mt-1">50 free credits renew every 30 days</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {tier !== 'free' && subscription?.status === 'active' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 text-[13px] font-medium transition-all active:scale-[0.98]"
              >
                Cancel Subscription
              </button>
            )}
            <a
              href="/pricing"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold transition-all active:scale-[0.98]"
            >
              {tier === 'free' ? 'Upgrade Plan' : 'View Plans'}
            </a>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="card-premium p-8 text-center">
            <p className="text-[14px] text-muted-foreground">No transactions yet. Your payment history will appear here.</p>
          </div>
        ) : (
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
                    <th className="text-right px-4 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Credits</th>
                    <th className="text-right px-4 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <tr key={tx.id || i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-foreground">{tx.description || '—'}</td>
                      <td className={`px-4 py-3 text-[13px] font-semibold text-right tabular-nums ${tx.amount > 0 ? 'text-success' : tx.amount < 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground text-right capitalize whitespace-nowrap">
                        {tx.transaction_type?.replace(/_/g, ' ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => !canceling && setShowCancelModal(false)}>
          <div className="card-premium p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-2">Cancel subscription?</h3>
            <p className="text-[14px] text-muted-foreground mb-4">
              Your subscription will remain active until the end of your current billing period. After that, your account will revert to the Free plan. You will keep your remaining credits until they expire.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={canceling}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-[13px] font-medium transition-all active:scale-[0.98]"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/90 text-white text-[13px] font-semibold transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
              >
                {canceling && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// SUPPORT VIEW
// ============================================================
function SupportView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Support</h1>
        <p className="text-[14px] text-muted-foreground">Need help? We answer fast.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-premium p-6">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Email Us</h3>
          <p className="text-[14px] text-muted-foreground mb-3">A real person reads every email. Usually replies within a few hours.</p>
          <a href="mailto:support@baddecision.ai" className="text-primary hover:text-primary/80 font-semibold text-[14px]">
            support@baddecision.ai
          </a>
        </div>

        <div className="card-premium p-6">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">FAQ</h3>
          <p className="text-[14px] text-muted-foreground mb-3">Most questions are already answered on our FAQ page.</p>
          <a href="/faq" className="text-primary hover:text-primary/80 font-semibold text-[14px]">
            Read FAQ →
          </a>
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="text-lg font-bold text-foreground mb-3">Quick Tips</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0">1.</span>
            <p className="text-[14px] text-muted-foreground">Be specific in your search. &ldquo;Roofers in Dallas&rdquo; works better than just &ldquo;roofers&rdquo;.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0">2.</span>
            <p className="text-[14px] text-muted-foreground">Pick the right engine. If you sell websites, use &ldquo;Businesses Without Websites&rdquo;.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0">3.</span>
            <p className="text-[14px] text-muted-foreground">Export your leads right away. Save them to your computer so you always have them.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0">4.</span>
            <p className="text-[14px] text-muted-foreground">Send your pitch the same day you get leads. Fresh contacts respond better.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// OUTREACH SETTINGS FORM — shared by MessagesView and SettingsView
// Fetches + saves the user's service offering, target audience, and
// copywriting style via /api/backend/settings (proxied to backend
// GET/PUT /api/settings/{user_id}).
// ============================================================
function OutreachSettingsForm({ onSaved }: { onSaved?: () => void }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [userService, setUserService] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [style, setStyle] = useState<CopywritingStyle>('david_ogilvy')
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/backend/settings')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        if (data?.settings) {
          setUserService(data.settings.user_service || '')
          setTargetAudience(data.settings.target_audience || '')
          setCompanyName(data.settings.company_name || '')
          setSenderName(data.settings.sender_name || '')
          const s = data.settings.copywriting_style
          setStyle(
            COPYWRITING_STYLES.some(c => c.id === s) ? (s as CopywritingStyle) : 'david_ogilvy'
          )
        }
      })
      .catch(err => {
        console.warn('[OutreachSettings] Failed to load:', err)
        setError('Could not load your current settings.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSavedAt(null)
    try {
      const res = await fetch('/api/backend/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_service: userService,
          target_audience: targetAudience,
          copywriting_style: style,
          company_name: companyName,
          sender_name: senderName,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || `Failed to save (${res.status})`)
      }
      setSavedAt(Date.now())
      onSaved?.()
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SettingsViewSkeleton />
    )
  }

  return (
    <div className="card-premium p-5 space-y-4">
      {/* Company name + Your name — side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Your Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Marketing"
            className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[14px] outline-none transition-colors"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Used in sign-offs and subject lines.
          </p>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Your Name
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g. Alex Johnson"
            className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[14px] outline-none transition-colors"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            How you want to be addressed in messages.
          </p>
        </div>
      </div>

      {/* Service offering */}
      <div>
        <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
          What do you sell?
        </label>
        <textarea
          value={userService}
          onChange={(e) => setUserService(e.target.value)}
          rows={3}
          placeholder="e.g. We build high-converting websites for roofers and home service businesses."
          className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[14px] outline-none transition-colors resize-none"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Describe your service clearly. This gets used to personalize every outreach message.
        </p>
      </div>

      {/* Target audience */}
      <div>
        <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
          Who is your target audience?
        </label>
        <textarea
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          rows={3}
          placeholder="e.g. Roofing companies in the US doing $500k+ in revenue, owners who handle sales themselves."
          className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[14px] outline-none transition-colors resize-none"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Be specific. The more you narrow it down, the sharper your messages will be.
        </p>
      </div>

      {/* Copywriting style */}
      <div>
        <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
          Copywriting style
        </label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as CopywritingStyle)}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[14px] outline-none transition-colors"
        >
          {COPYWRITING_STYLES.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <p className="text-[11px] text-muted-foreground mt-1">
          {COPYWRITING_STYLES.find(s => s.id === style)?.desc || 'Pick the voice that matches your brand.'}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-[13px] text-destructive">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <div className="text-[12px] text-muted-foreground">
          {savedAt ? (
            <span className="text-success font-semibold inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          ) : (
            <span>Changes save when you click the button.</span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// MESSAGES VIEW — outreach-focused settings + how-to tips
// ============================================================
function MessagesView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Messages</h1>
        <p className="text-[14px] text-muted-foreground">
          Configure how your outreach messages are written. We use these settings to personalize every message generated for your leads.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Your Outreach Defaults</h2>
        <OutreachSettingsForm />
      </div>

      {/* Tips */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-bold text-foreground mb-3">How to use outreach messages</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0">1.</span>
            <p className="text-[14px] text-muted-foreground">
              Fill out your service offering and target audience above. The more specific you are, the more personalized your messages will be.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0">2.</span>
            <p className="text-[14px] text-muted-foreground">
              Pick a copywriting style that matches your brand voice. You can change it anytime — every new message uses your current style.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0">3.</span>
            <p className="text-[14px] text-muted-foreground">
              Run a search, then click &ldquo;Generate Messages&rdquo; on any lead card. We&rsquo;ll write 3 personalized openers using your settings.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0">4.</span>
            <p className="text-[14px] text-muted-foreground">
              Always edit the generated messages before sending. They&rsquo;re a strong starting point — not a final draft. Add specifics about the lead to make them feel hand-written.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0">5.</span>
            <p className="text-[14px] text-muted-foreground">
              Test different styles against the same audience. Your conversion rate will tell you which voice resonates best.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SETTINGS VIEW — account info + outreach defaults
// ============================================================
function SettingsView({ tier }: { tier: string }) {
  const { user } = useUser()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-[14px] text-muted-foreground">Manage your account and outreach defaults.</p>
      </div>

      {/* Account info */}
      <div className="card-premium p-5">
        <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wide mb-3">Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Email</div>
            <div className="text-[14px] text-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress || 'Not available'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Name</div>
            <div className="text-[14px] text-foreground truncate">
              {user?.firstName || user?.fullName || 'Not set'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Plan</div>
            <div className="text-[14px] text-primary font-semibold uppercase">{tier}</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <a
            href="/pricing#pricing-table"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:border-primary/50 text-card-foreground text-[13px] font-semibold transition-colors"
          >
            {tier === 'free' ? 'Upgrade Plan' : 'View Plans'}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Outreach defaults */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Outreach Defaults</h2>
        <p className="text-[14px] text-muted-foreground mb-4">
          These defaults are used every time we generate outreach messages for your leads. Update them whenever your offer or audience changes.
        </p>
        <OutreachSettingsForm />
      </div>
    </div>
  )
}

// ============================================================
// OUTREACH MESSAGES — on-demand generation inside each lead card
// ============================================================
function OutreachMessages({ lead, onLeadsUpdated }: { lead: Lead, onLeadsUpdated?: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Derive messages directly from the lead prop — no local state.
  // This eliminates the entire class of "messages appear then disappear" bugs
  // caused by useEffect/useState sync issues after batch re-fetch.
  // The parent owns the lead data; we just render it.
  const messages = {
    subject: lead.outreach_email_subject && lead.outreach_email_subject !== 'ABSENT' ? lead.outreach_email_subject : '',
    email: lead.outreach_email && lead.outreach_email !== 'ABSENT' ? lead.outreach_email : '',
    social: lead.outreach_social && lead.outreach_social !== 'ABSENT' ? lead.outreach_social : '',
    call: lead.outreach_call && lead.outreach_call !== 'ABSENT' ? lead.outreach_call : '',
  }

  // Auto-expand when messages first appear (after batch generation or single generate).
  // Runs only when hasAny transitions from false → true.
  const hasAny = Boolean(messages.email || messages.social || messages.call)
  const prevHadAny = useRef(hasAny)
  useEffect(() => {
    if (hasAny && !prevHadAny.current) {
      setExpanded(true)
    }
    prevHadAny.current = hasAny
  }, [hasAny])

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch (err) {
      console.warn('[OutreachMessages] Clipboard write failed:', err)
    }
  }

  const handleGenerate = async () => {
    if (!lead.id) {
      setError('Lead ID not available. Try refreshing the page.')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/backend/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id }),
      })
      // Handle non-JSON responses gracefully (backend may return plain text errors)
      const responseText = await res.text()
      let data: any
      try {
        data = JSON.parse(responseText)
      } catch {
        data = { error: responseText.slice(0, 200) || `Server error (${res.status})` }
      }
      if (!res.ok) {
        setError(data.detail || data.error || `Could not generate messages (${res.status}).`)
      } else {
        // Tell the parent to re-fetch leads so this component receives the
        // updated lead prop (with outreach_email populated).
        onLeadsUpdated?.()
        setExpanded(true)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Check your connection and try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-border">
      {!hasAny && !generating && (
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-[12px] font-semibold transition-colors w-full justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Write Outreach Messages
        </button>
      )}

      {generating && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-[12px] text-muted-foreground">
          <svg className="animate-spin w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Writing personalized messages...
        </div>
      )}

      {error && !generating && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 mb-2">
          <p className="text-[12px] text-destructive">{error}</p>
        </div>
      )}

      {hasAny && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center justify-between w-full text-left gap-2 group"
            aria-expanded={expanded}
          >
            <span className="flex items-center gap-2 text-[12px] font-bold text-foreground uppercase tracking-wide">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z" />
              </svg>
              Outreach Messages
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
                className="text-[10px] text-primary hover:text-primary/80 font-semibold"
                title="Regenerate messages"
              >
                ↻ Regenerate
              </button>
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {messages.email && (
                <MessageRow
                  icon="📧" label="Email" text={messages.email}
                  subject={messages.subject}
                  tint="bg-azure-soft border-azure/30"
                  onCopy={() => handleCopy(messages.email, 'email')}
                  onCopySubject={messages.subject ? () => handleCopy(messages.subject, 'subject') : undefined}
                  copied={copied === 'email'}
                  copiedSubject={copied === 'subject'}
                />
              )}
              {messages.social && (
                <MessageRow
                  icon="💬" label="Social DM" text={messages.social}
                  tint="bg-violet-soft border-primary/30"
                  onCopy={() => handleCopy(messages.social, 'social')}
                  copied={copied === 'social'}
                />
              )}
              {messages.call && (
                <MessageRow
                  icon="📞" label="Cold Call" text={messages.call}
                  tint="bg-warning-soft border-warning/30"
                  onCopy={() => handleCopy(messages.call, 'call')}
                  copied={copied === 'call'}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MessageRow({
  icon, label, text, subject, tint, onCopy, onCopySubject, copied, copiedSubject,
}: {
  icon: string
  label: string
  text: string
  subject?: string
  tint: string
  onCopy: () => void
  onCopySubject?: () => void
  copied: boolean
  copiedSubject?: boolean
}) {
  return (
    <div className={`rounded-lg border p-3 ${tint}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
          <span>{icon}</span> {label}
        </span>
        <button
          onClick={onCopy}
          className="text-[11px] text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      {subject && (
        <div className="mb-2 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Subject Line</span>
            {onCopySubject && (
              <button
                onClick={onCopySubject}
                className="text-[10px] text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                {copiedSubject ? '✓ Copied' : 'Copy Subject'}
              </button>
            )}
          </div>
          <p className="text-[13px] font-semibold text-foreground leading-snug">{subject}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{subject.length} characters</p>
        </div>
      )}
      <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">{text}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{text.length} characters</p>
    </div>
  )
}
