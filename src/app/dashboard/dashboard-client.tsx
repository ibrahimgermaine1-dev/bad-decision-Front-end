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

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useAppStore, type EngineType, type Lead, type SmartCollection } from '@/stores/app-store'
import { startSearch, pollUntilComplete, fetchCreditBalance, verifyPayment, fetchCollections } from '@/lib/api'
import { CREDIT_ADDONS, type TierId, formatAddonPrice, isEngineAvailable } from '@/lib/pricing'
import { LocationSelector } from '@/components/location-selector'
import { exportLeadsToCsv, downloadCsv } from '@/lib/csv-shield'

type DashView = 'search' | 'collections' | 'credits' | 'support' | 'settings'

// Copywriting styles offered for personalized outreach messages.
// IDs must match the backend regex in main.py (UpdateSettingsRequest.copywriting_style).
const COPYWRITING_STYLES: Array<{ id: string; label: string; desc: string }> = [
  { id: 'dan_kennedy',    label: 'Direct & Bold',           desc: 'Dan Kennedy' },
  { id: 'donald_miller',  label: 'Story-Driven',            desc: 'Donald Miller' },
  { id: 'ray_edwards',    label: 'Warm & Conversational',   desc: 'Ray Edwards' },
  { id: 'david_ogilvy',   label: 'Punchy & Witty',          desc: 'David Ogilvy' },
  { id: 'jay_abraham',    label: 'Educational',             desc: 'Jay Abraham' },
  { id: 'gary_halbert',   label: 'Curiosity-Driven',        desc: 'Gary Halbert' },
]

const ENGINE_CARDS = [
  {
    id: 'smb_maps' as EngineType,
    title: 'Local Businesses',
    desc: 'Find shops, clinics, and offices with real addresses.',
    creditCost: 1,
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 'ads_intent' as EngineType,
    title: 'Companies Running Ads',
    desc: 'Find businesses spending money on ads right now.',
    creditCost: 2,
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  },
  {
    id: 'web_absent' as EngineType,
    title: 'Businesses Without Websites',
    desc: 'Find businesses that need a website built.',
    creditCost: 2,
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  },
  {
    id: 'social_intent' as EngineType,
    title: 'People Asking For Help',
    desc: 'Find people who want to buy right now.',
    creditCost: 2,
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
]

export function DashboardShell() {
  const router = useRouter()
  const { isSignedIn, isLoaded, userId } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()

  const {
    creditBalance, setCreditBalance,
    tier,
    userCountry,
    collections, setCollections,
  } = useAppStore()

  // ===== STATE (all properly declared — fixes selectedCountry bug) =====
  const [activeView, setActiveView] = useState<DashView>('search')
  const [selectedEngine, setSelectedEngine] = useState<EngineType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('NG')
  const [selectedState, setSelectedState] = useState('')
  const [searchStatus, setSearchStatus] = useState<'idle' | 'processing' | 'completed' | 'failed' | 'exhausted'>('idle')
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchError, setSearchError] = useState('')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // ===== ONBOARDING + SETTINGS STATE =====
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userService, setUserService] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [copywritingStyle, setCopywritingStyle] = useState('david_ogilvy')
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSavedAt, setSettingsSavedAt] = useState<number | null>(null)
  const [settingsError, setSettingsError] = useState('')

  // ===== FETCH CREDIT BALANCE ON MOUNT =====
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

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in')
      return
    }
    loadBalance()
  }, [isLoaded, isSignedIn, router, loadBalance])

  // ===== FETCH COLLECTIONS =====
  useEffect(() => {
    if (userId) {
      fetchCollections(userId).then(cols => setCollections(cols)).catch(() => {})
    }
  }, [userId, setCollections])

  // ===== FETCH USER SETTINGS (show onboarding modal if user_service is empty) =====
  const loadSettings = useCallback(async () => {
    if (!userId) return
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/backend/settings', { method: 'GET' })
      const data = await res.json()
      const s = (data && data.settings) || data || {}
      const svc = typeof s.user_service === 'string' ? s.user_service : ''
      const aud = typeof s.target_audience === 'string' ? s.target_audience : ''
      const sty = typeof s.copywriting_style === 'string' && s.copywriting_style ? s.copywriting_style : 'david_ogilvy'
      setUserService(svc)
      setTargetAudience(aud)
      setCopywritingStyle(sty)
      // Show onboarding only on first dashboard visit when service offering is empty.
      if (!svc.trim()) {
        setShowOnboarding(true)
      }
    } catch (err) {
      console.warn('[Dashboard] Failed to fetch settings:', err)
    } finally {
      setSettingsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // ===== SAVE SETTINGS (used by onboarding modal + settings view) =====
  const handleSaveSettings = useCallback(async (svc: string, aud: string, style: string): Promise<boolean> => {
    setSettingsSaving(true)
    setSettingsError('')
    try {
      const res = await fetch('/api/backend/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_service: svc.trim(),
          target_audience: aud.trim(),
          copywriting_style: style,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || data.detail || `Save failed (${res.status})`)
      }
      setUserService(svc.trim())
      setTargetAudience(aud.trim())
      setCopywritingStyle(style)
      setSettingsSavedAt(Date.now())
      return true
    } catch (err: any) {
      console.error('[Dashboard] Save settings failed:', err)
      setSettingsError(err.message || 'Could not save settings. Please try again.')
      return false
    } finally {
      setSettingsSaving(false)
    }
  }, [])

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
  }, [selectedEngine, searchQuery, selectedCountry, selectedState, loadBalance])

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

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (err) {
      console.error('Sign out error:', err)
      // Force redirect even if signOut fails
      window.location.href = '/'
    }
  }

  // ===== LOADING STATE =====
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Script src="https://js.paystack.co/v2/inline.js" />

      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-card-foreground/10 transition-colors"
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card-foreground/10 border border-primary/20">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="text-[13px] font-bold text-card-foreground">{creditBalance.credits_balance}</span>
        </div>
      </div>

      {/* ===== SIDEBAR ===== */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-30
          h-screen w-64 flex-shrink-0
          bg-card border-r border-border
          flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo */}
          <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xs">BD</span>
            </div>
            <div>
              <div className="font-bold text-[14px] text-card-foreground">Bad Decision</div>
              <div className="text-[9px] text-card-foreground/60 uppercase tracking-wide">Lead Intelligence</div>
            </div>
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
              <div className="text-2xl font-bold text-card-foreground">{creditBalance.credits_balance}</div>
              <div className="text-[11px] text-card-foreground/60 mt-0.5">{creditBalance.credits_reserved} reserved</div>
              <button
                onClick={() => { setActiveView('credits'); setSidebarOpen(false) }}
                className={`w-full mt-2.5 py-2 rounded-lg text-[12px] font-bold transition-all ${
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
              icon="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              label="Support"
              active={activeView === 'support'}
              onClick={() => { setActiveView('support'); setSidebarOpen(false) }}
            />
            <NavItem
              icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              label="Settings"
              active={activeView === 'settings'}
              onClick={() => { setActiveView('settings'); setSidebarOpen(false) }}
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
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 text-[12px] font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeView === 'search' && (
            <SearchView
              selectedEngine={selectedEngine}
              setSelectedEngine={setSelectedEngine}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
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
          {activeView === 'support' && (
            <SupportView />
          )}
          {activeView === 'settings' && (
            <SettingsView
              userService={userService}
              targetAudience={targetAudience}
              copywritingStyle={copywritingStyle}
              saving={settingsSaving}
              savedAt={settingsSavedAt}
              error={settingsError}
              loading={settingsLoading}
              onSave={handleSaveSettings}
              onOpenOnboarding={() => setShowOnboarding(true)}
            />
          )}
        </div>
      </main>

      {/* ===== ONBOARDING MODAL ===== */}
      {showOnboarding && (
        <OnboardingModal
          userService={userService}
          targetAudience={targetAudience}
          copywritingStyle={copywritingStyle}
          saving={settingsSaving}
          error={settingsError}
          setUserService={setUserService}
          setTargetAudience={setTargetAudience}
          setCopywritingStyle={setCopywritingStyle}
          onComplete={async () => {
            const ok = await handleSaveSettings(userService, targetAudience, copywritingStyle)
            if (ok) setShowOnboarding(false)
          }}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
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
  searchStatus, searchError, leads, progress, currentStep, onSearch, creditBalance, tier
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
                  {activeEngine?.creditCost} credits
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
                            {engine.creditCost} credits
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
            className={`w-full py-3.5 rounded-lg font-semibold text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
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
                Search · {activeEngine?.creditCost} credits
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

          {/* Skeleton Lead Rows — makes the user feel something is happening */}
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 pulse-row">
                <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 rounded bg-muted w-1/3" />
                  <div className="h-2.5 rounded bg-muted w-1/2" />
                </div>
                <div className="w-16 h-6 rounded bg-muted flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searchStatus === 'completed' && (
        <ResultsView leads={leads} engineType={selectedEngine} />
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
function ResultsView({ leads, engineType }: { leads: Lead[], engineType: EngineType | null }) {
  const [sortBy, setSortBy] = useState<string>('default')

  const handleExport = () => {
    const csv = exportLeadsToCsv(leads, engineType || undefined)
    downloadCsv(csv, `bad-decision-leads-${Date.now()}.csv`)
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
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border hover:border-primary/50 text-card-foreground text-[13px] font-semibold transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export CSV
    </button>
  )

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
  // SMB_MAPS — Local Businesses
  // ============================================================
  if (engineType === 'smb_maps') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {leads.length} local {leads.length === 1 ? 'business' : 'businesses'} found
            </h2>
            <p className="text-[13px] text-muted-foreground">Shops, clinics, and offices ready to contact.</p>
          </div>
          {renderExportBtn()}
        </div>
        {renderSortBar([
          { value: 'rating', label: 'Rating' },
          { value: 'name', label: 'Name (A-Z)' },
          { value: 'email', label: 'Has Email' },
        ])}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedLeads.map((lead, i) => (
            <div key={i} className="card-premium p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[15px] text-foreground truncate">{lead.company_name}</h3>
                  {lead.category && lead.category !== 'ABSENT' && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-violet-soft text-primary text-[10px] font-bold uppercase tracking-wide">
                      {lead.category}
                    </span>
                  )}
                </div>
                {lead.rating != null && Number(lead.rating) > 0 && (
                  <div className="flex items-center gap-1 text-[13px] font-bold text-foreground shrink-0">
                    <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {Number(lead.rating).toFixed(1)}
                    {lead.review_count != null && Number(lead.review_count) > 0 && (
                      <span className="text-[11px] font-normal text-muted-foreground ml-1">
                        ({Number(lead.review_count).toLocaleString()})
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2 mt-2">
                {lead.address && lead.address !== 'ABSENT' && (
                  <div className="flex items-start gap-2 text-[13px]">
                    <svg className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-foreground">{lead.address}</span>
                  </div>
                )}
                {lead.phone && lead.phone !== 'ABSENT' && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${lead.phone}`} className="text-foreground hover:text-primary transition-colors">{lead.phone}</a>
                  </div>
                )}
                {lead.website_url && lead.website_url !== 'ABSENT' && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a href={normalizeUrl(lead.website_url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors truncate">
                      {cleanUrl(lead.website_url)}
                    </a>
                  </div>
                )}
                {lead.verified_email && lead.verified_email !== 'ABSENT' && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground truncate">{lead.verified_email}</span>
                    <span className="text-[10px] font-bold uppercase text-success">Verified</span>
                  </div>
                )}
              </div>
              {renderSocialLinks(lead)}
              <OutreachMessages lead={lead} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // ADS_INTENT — Ads Intelligence
  // ============================================================
  if (engineType === 'ads_intent') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {leads.length} {leads.length === 1 ? 'business' : 'businesses'} running ads found
            </h2>
            <p className="text-[13px] text-muted-foreground">Companies actively spending on ads right now.</p>
          </div>
          {renderExportBtn()}
        </div>
        {renderSortBar([
          { value: 'platform', label: 'Platform' },
          { value: 'name', label: 'Name (A-Z)' },
          { value: 'email', label: 'Has Email' },
        ])}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedLeads.map((lead, i) => {
            const isActive = (lead.ad_status || '').toLowerCase() === 'active'
            return (
              <div key={i} className="card-premium p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[15px] text-foreground truncate">{lead.company_name}</h3>
                  </div>
                  {renderAdPlatformBadge(lead.ad_platform)}
                </div>
                {lead.ad_status && lead.ad_status !== 'ABSENT' && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-success' : 'bg-muted-foreground'}`} />
                    <span className={`text-[12px] font-semibold ${isActive ? 'text-success' : 'text-muted-foreground'}`}>
                      {lead.ad_status}
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  {lead.website_url && lead.website_url !== 'ABSENT' && (
                    <div className="flex items-center gap-2 text-[13px]">
                      <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a href={normalizeUrl(lead.website_url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors truncate">
                        {cleanUrl(lead.website_url)}
                      </a>
                    </div>
                  )}
                  {lead.verified_email && lead.verified_email !== 'ABSENT' && (
                    <div className="flex items-center gap-2 text-[13px]">
                      <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-foreground truncate">{lead.verified_email}</span>
                    </div>
                  )}
                  {lead.phone && lead.phone !== 'ABSENT' && (
                    <div className="flex items-center gap-2 text-[13px]">
                      <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${lead.phone}`} className="text-foreground hover:text-primary transition-colors">{lead.phone}</a>
                    </div>
                  )}
                  {lead.dm_name && lead.dm_name !== 'ABSENT' && (
                    <div className="flex items-center gap-2 text-[13px]">
                      <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-foreground">{lead.dm_name}</span>
                      {lead.dm_position && lead.dm_position !== 'ABSENT' && (
                        <span className="text-muted-foreground">· {lead.dm_position}</span>
                      )}
                    </div>
                  )}
                </div>
                {renderSocialLinks(lead)}
                <OutreachMessages lead={lead} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================
  // WEB_ABSENT — Businesses Without Websites
  // ============================================================
  if (engineType === 'web_absent') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {leads.length} {leads.length === 1 ? 'business' : 'businesses'} that need a website found
            </h2>
            <p className="text-[13px] text-muted-foreground">Listed on aggregators but missing a website — easy wins.</p>
          </div>
          {renderExportBtn()}
        </div>
        {renderSortBar([
          { value: 'rating', label: 'Rating' },
          { value: 'name', label: 'Name (A-Z)' },
          { value: 'phone', label: 'Has Phone' },
        ])}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedLeads.map((lead, i) => (
            <div key={i} className="card-premium p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[15px] text-foreground truncate">{lead.company_name}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-danger-soft text-danger text-[10px] font-bold uppercase shrink-0">
                  No Website
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {renderAggregatorBadge(lead.aggregator_source)}
                {lead.aggregator_rating != null && Number(lead.aggregator_rating) > 0 && (
                  <div className="flex items-center gap-1 text-[12px] font-bold text-foreground">
                    <svg className="w-3.5 h-3.5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {Number(lead.aggregator_rating).toFixed(1)}
                  </div>
                )}
                <span className="px-2 py-0.5 rounded-md bg-success-soft text-success text-[10px] font-bold uppercase">
                  Needs Website
                </span>
              </div>
              <div className="space-y-2">
                {lead.aggregator_url && lead.aggregator_url !== 'ABSENT' && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <a href={normalizeUrl(lead.aggregator_url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors truncate">
                      View aggregator profile
                    </a>
                  </div>
                )}
                {lead.phone && lead.phone !== 'ABSENT' && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${lead.phone}`} className="text-foreground hover:text-primary transition-colors">{lead.phone}</a>
                  </div>
                )}
                {lead.address && lead.address !== 'ABSENT' && (
                  <div className="flex items-start gap-2 text-[13px]">
                    <svg className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-foreground">{lead.address}</span>
                  </div>
                )}
              </div>
              <OutreachMessages lead={lead} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // SOCIAL_INTENT — Social Radar
  // ============================================================
  if (engineType === 'social_intent') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {leads.length} {leads.length === 1 ? 'person' : 'people'} looking for help found
            </h2>
            <p className="text-[13px] text-muted-foreground">Real people posting about problems you can solve.</p>
          </div>
          {renderExportBtn()}
        </div>
        {renderSortBar([
          { value: 'intent', label: 'Intent Level' },
          { value: 'platform', label: 'Platform' },
        ])}
        <div className="grid grid-cols-1 gap-3">
          {sortedLeads.map((lead, i) => {
            const isHigh = (lead.intent_level || '').toLowerCase() === 'high'
            return (
              <div key={i} className="card-premium p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[15px] text-foreground truncate">
                      {lead.author_username || lead.company_name || 'Anonymous'}
                    </h3>
                  </div>
                  {renderSocialPlatformBadge(lead.platform)}
                </div>
                {lead.intent_text && lead.intent_text !== 'ABSENT' && (
                  <div className="my-3 pl-3 border-l-2 border-primary/40">
                    <p className="text-[14px] italic text-foreground leading-relaxed">
                      &ldquo;{lead.intent_text}&rdquo;
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {lead.intent_level && lead.intent_level !== 'ABSENT' && (
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${intentBadgeClass(lead.intent_level)}`}>
                      {lead.intent_level} Intent
                    </span>
                  )}
                  {isHigh && (
                    <span className="px-2.5 py-1 rounded-md bg-success-soft text-success text-[10px] font-bold uppercase">
                      Ready to Buy
                    </span>
                  )}
                </div>
                {lead.post_url && lead.post_url !== 'ABSENT' && (
                  <div className="flex items-center gap-2 mt-3 text-[13px]">
                    <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <a href={normalizeUrl(lead.post_url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors truncate">
                      View original post
                    </a>
                  </div>
                )}
                <OutreachMessages lead={lead} />
              </div>
            )
          })}
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
        {renderExportBtn()}
      </div>
      <div className="grid grid-cols-1 gap-3">
        {sortedLeads.map((lead, i) => (
          <div key={i} className="card-premium p-4 sm:p-5">
            <h3 className="font-bold text-[15px] text-foreground mb-1 truncate">{lead.company_name}</h3>
            {lead.website_url && lead.website_url !== 'ABSENT' && (
              <a href={normalizeUrl(lead.website_url)} target="_blank" rel="noopener noreferrer" className="text-[13px] text-primary hover:text-primary/80 transition-colors">
                {cleanUrl(lead.website_url)}
              </a>
            )}
            <OutreachMessages lead={lead} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// COLLECTIONS VIEW — grouped by engine type
// ============================================================
const ENGINE_META: Record<EngineType, { name: string; iconPath: string }> = {
  smb_maps: {
    name: 'Local Businesses',
    iconPath: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  ads_intent: {
    name: 'Ads Intelligence',
    iconPath: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  },
  web_absent: {
    name: 'Web-Absent',
    iconPath: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  },
  social_intent: {
    name: 'Social Radar',
    iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
}

const ENGINE_ORDER: EngineType[] = ['smb_maps', 'ads_intent', 'web_absent', 'social_intent']

function CollectionsView({ collections }: { collections: SmartCollection[] }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const grouped = useMemo(() => {
    const groups: Record<EngineType, SmartCollection[]> = {
      smb_maps: [],
      ads_intent: [],
      web_absent: [],
      social_intent: [],
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Your Collections</h1>
        <p className="text-[14px] text-muted-foreground">Every search you run gets saved here, grouped by engine type.</p>
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
                      <div key={col.id} className="rounded-lg border border-border-light p-3 bg-muted/30 hover:bg-muted/60 transition-colors">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-[11px] text-muted-foreground truncate">{col.created_at}</span>
                          <span className="text-[12px] font-bold text-primary shrink-0">{col.lead_count} {col.lead_count === 1 ? 'lead' : 'leads'}</span>
                        </div>
                        <h4 className="font-semibold text-[14px] text-foreground truncate">{col.name}</h4>
                      </div>
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

      {/* Buy Credits */}
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

      {/* Upgrade Plan */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Or Upgrade Your Plan</h2>
        <div className="card-premium p-5">
          <p className="text-[14px] text-muted-foreground mb-4">
            Plans give you credits every month at a better price. Plus more search engines and higher daily limits.
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
            <p className="text-[14px] text-muted-foreground">Be specific in your search. "Roofers in Dallas" works better than just "roofers".</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0">2.</span>
            <p className="text-[14px] text-muted-foreground">Pick the right engine. If you sell websites, use "Businesses Without Websites".</p>
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
// ONBOARDING MODAL — first-visit service setup
// ============================================================
function OnboardingModal({
  userService, setUserService,
  targetAudience, setTargetAudience,
  copywritingStyle, setCopywritingStyle,
  saving, error,
  onComplete, onDismiss,
}: {
  userService: string
  setUserService: (s: string) => void
  targetAudience: string
  setTargetAudience: (s: string) => void
  copywritingStyle: string
  setCopywritingStyle: (s: string) => void
  saving: boolean
  error: string
  onComplete: () => void
  onDismiss: () => void
}) {
  const canComplete = userService.trim().length > 0 && targetAudience.trim().length > 0 && !saving

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative card-premium w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close (dismiss) */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Let&apos;s write your outreach.</h2>
          <p className="text-[14px] text-muted-foreground">
            Tell us what you sell and who you help. We use this to write personalized email, social, and call scripts for every lead you find.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
              What do you sell?
            </label>
            <input
              type="text"
              value={userService}
              onChange={(e) => setUserService(e.target.value)}
              placeholder="e.g. I build websites for small businesses"
              className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[15px] outline-none transition-colors"
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
              Who is your ideal customer?
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Local businesses without a website"
              className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[15px] outline-none transition-colors"
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
              Pick your message style
            </label>
            <select
              value={copywritingStyle}
              onChange={(e) => setCopywritingStyle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[15px] outline-none transition-colors appearance-none cursor-pointer"
            >
              {COPYWRITING_STYLES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.desc})
                </option>
              ))}
            </select>
            <p className="text-[12px] text-muted-foreground mt-1.5">
              You can change this anytime in Settings.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-[13px] text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onComplete}
            disabled={!canComplete}
            className="w-full py-3.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[15px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving...
              </span>
            ) : (
              'Complete Setup'
            )}
          </button>
          <button
            onClick={onDismiss}
            className="w-full py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SETTINGS VIEW — manage service offering + copywriting style
// ============================================================
function SettingsView({
  userService, targetAudience, copywritingStyle,
  saving, savedAt, error, loading,
  onSave, onOpenOnboarding,
}: {
  userService: string
  targetAudience: string
  copywritingStyle: string
  saving: boolean
  savedAt: number | null
  error: string
  loading: boolean
  onSave: (svc: string, aud: string, style: string) => Promise<boolean>
  onOpenOnboarding: () => void
}) {
  // Local editable copy so the user can type freely without immediately
  // mutating the shared dashboard state.
  const [svc, setSvc] = useState(userService)
  const [aud, setAud] = useState(targetAudience)
  const [sty, setSty] = useState(copywritingStyle)
  const [justSaved, setJustSaved] = useState(false)

  // Sync from props when upstream settings change (e.g. after onboarding save).
  useEffect(() => { setSvc(userService) }, [userService])
  useEffect(() => { setAud(targetAudience) }, [targetAudience])
  useEffect(() => { setSty(copywritingStyle) }, [copywritingStyle])

  // Flash the "Saved" pill for ~2.5s after a successful save.
  useEffect(() => {
    if (!savedAt) return
    setJustSaved(true)
    const t = setTimeout(() => setJustSaved(false), 2500)
    return () => clearTimeout(t)
  }, [savedAt])

  const dirty = svc !== userService || aud !== targetAudience || sty !== copywritingStyle

  const handleSave = async () => {
    await onSave(svc, aud, sty)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Settings</h1>
          <p className="text-[14px] text-muted-foreground">Loading your preferences...</p>
        </div>
        <div className="card-premium p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted border border-border mb-3">
            <svg className="animate-spin w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
          <p className="text-[14px] text-muted-foreground">One moment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-[14px] text-muted-foreground">
          These power your personalized outreach messages. Update anytime.
        </p>
      </div>

      {/* Service card */}
      <div className="card-premium p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">Your Service Offering</h2>
          <p className="text-[13px] text-muted-foreground">
            Tell us what you sell and who you serve. We use this to write emails, DMs, and call scripts for every lead.
          </p>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            What do you sell?
          </label>
          <input
            type="text"
            value={svc}
            onChange={(e) => setSvc(e.target.value)}
            placeholder="e.g. I build websites for small businesses"
            className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[15px] outline-none transition-colors"
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Who is your ideal customer?
          </label>
          <input
            type="text"
            value={aud}
            onChange={(e) => setAud(e.target.value)}
            placeholder="e.g. Local businesses without a website"
            className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[15px] outline-none transition-colors"
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Message style
          </label>
          <select
            value={sty}
            onChange={(e) => setSty(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-primary text-foreground text-[15px] outline-none transition-colors appearance-none cursor-pointer"
          >
            {COPYWRITING_STYLES.map(s => (
              <option key={s.id} value={s.id}>
                {s.label} ({s.desc})
              </option>
            ))}
          </select>
          <p className="text-[12px] text-muted-foreground mt-1.5">
            Each style writes outreach in a different voice. Try a few to see what converts.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-[13px] text-destructive">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
          <button
            onClick={onOpenOnboarding}
            className="text-[13px] text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Reopen setup guide
          </button>
          <div className="flex items-center gap-3">
            {justSaved && (
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-success">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Helper note */}
      <div className="card-premium p-5 bg-card border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-card-foreground mb-1">How outreach messages work</h3>
            <p className="text-[13px] text-card-foreground/80 leading-relaxed">
              When your service offering is set, every lead you find comes with three ready-to-send messages:
              an email, a social DM, and a cold-call script — all written in your chosen style. Skip setup and
              the messages will say ABSENT until you do.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// OUTREACH MESSAGES — expandable section inside each lead card
// ============================================================
function OutreachMessages({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const email = lead.outreach_email && lead.outreach_email !== 'ABSENT' ? lead.outreach_email : ''
  const social = lead.outreach_social && lead.outreach_social !== 'ABSENT' ? lead.outreach_social : ''
  const call = lead.outreach_call && lead.outreach_call !== 'ABSENT' ? lead.outreach_call : ''
  const hasAny = Boolean(email || social || call)

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch (err) {
      console.warn('[OutreachMessages] Clipboard write failed:', err)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-border">
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
          {!hasAny && (
            <span className="px-1.5 py-0.5 rounded bg-warning-soft text-warning text-[10px] font-bold normal-case tracking-normal">
              Not set up
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {!hasAny ? (
            <div className="rounded-lg bg-muted/50 border border-border-light p-3">
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Set up your service in <span className="font-semibold text-foreground">Settings</span> to get personalized outreach messages for every lead.
              </p>
            </div>
          ) : (
            <>
              {email && (
                <MessageRow
                  icon="📧"
                  label="Email"
                  text={email}
                  tint="bg-azure-soft border-azure/30"
                  onCopy={() => handleCopy(email, 'email')}
                  copied={copied === 'email'}
                />
              )}
              {social && (
                <MessageRow
                  icon="💬"
                  label="Social DM"
                  text={social}
                  tint="bg-violet-soft border-primary/30"
                  onCopy={() => handleCopy(social, 'social')}
                  copied={copied === 'social'}
                />
              )}
              {call && (
                <MessageRow
                  icon="📞"
                  label="Cold Call"
                  text={call}
                  tint="bg-warning-soft border-warning/30"
                  onCopy={() => handleCopy(call, 'call')}
                  copied={copied === 'call'}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function MessageRow({
  icon, label, text, tint, onCopy, copied,
}: {
  icon: string
  label: string
  text: string
  tint: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className={`rounded-lg border p-3 ${tint}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground">
          <span aria-hidden="true">{icon}</span>
          {label}
        </span>
        <button
          onClick={onCopy}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
            copied
              ? 'bg-success text-white'
              : 'bg-white/70 hover:bg-white text-foreground border border-border-light'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">{text}</p>
    </div>
  )
}
