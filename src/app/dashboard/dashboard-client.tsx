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

import { useState, useCallback, useEffect } from 'react'
import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useAppStore, type EngineType, type Lead } from '@/stores/app-store'
import { startSearch, pollUntilComplete, fetchCreditBalance, verifyPayment, fetchCollections } from '@/lib/api'
import { CREDIT_ADDONS, type TierId, formatAddonPrice, isEngineAvailable } from '@/lib/pricing'
import { LocationSelector } from '@/components/location-selector'
import { exportLeadsToCsv, downloadCsv } from '@/lib/csv-shield'

type DashView = 'search' | 'collections' | 'credits' | 'support'

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
  const handleBuyCredits = (addon: typeof CREDIT_ADDONS[0]) => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setPaymentError('Payment is not ready yet. Please contact support.')
      return
    }

    setPaymentProcessing(true)
    setPaymentError('')

    try {
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        const handler = (window as any).PaystackPop.setup({
          reference: crypto.randomUUID(),
          email: user?.primaryEmailAddress?.emailAddress || '',
          amount: addon.priceKobo,
          publicKey,
          currency: 'NGN',
          metadata: {
            user_id: userId || '',
            credits: addon.credits,
            type: 'credit_addon',
          },
          callback: (response: any) => {
            const reference = response?.reference || ''
            if (reference) {
              verifyPayment(reference).then((result) => {
                if (result.verified && result.balance) {
                  setCreditBalance({
                    credits_balance: result.balance.credits_balance ?? 0,
                    credits_reserved: result.balance.credits_reserved ?? 0,
                    total_purchased: result.balance.total_purchased ?? 0,
                  })
                }
                setPaymentProcessing(false)
              }).catch(() => {
                setTimeout(() => loadBalance(), 2000)
                setPaymentProcessing(false)
              })
            } else {
              setTimeout(() => loadBalance(), 2000)
              setPaymentProcessing(false)
            }
          },
          onClose: () => {
            setPaymentProcessing(false)
          },
        })
        handler.openIframe()
      } else {
        setPaymentError('Payment is still loading. Try again in a moment.')
        setPaymentProcessing(false)
      }
    } catch (err) {
      setPaymentError('Payment failed. Please try again.')
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
                className="w-full mt-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[12px] font-semibold transition-colors"
              >
                Get More Credits
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
  const canSearch = selectedEngine && searchQuery.trim() && searchStatus !== 'processing'
  const isLocked = (engineId: EngineType) => !isEngineAvailable(engineId, tier as TierId)

  const handleEngineClick = (engineId: EngineType) => {
    if (isLocked(engineId)) {
      // Navigate to pricing page when clicking a locked engine
      window.location.href = '/pricing'
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
                          href="/pricing"
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
            className="w-full py-3.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {searchStatus === 'processing' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Searching...
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
// RESULTS VIEW
// ============================================================
function ResultsView({ leads, engineType }: { leads: Lead[], engineType: EngineType | null }) {
  const handleExport = () => {
    const csv = exportLeadsToCsv(leads, engineType || undefined)
    downloadCsv(csv, `bad-decision-leads-${Date.now()}.csv`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {leads.length} verified {leads.length === 1 ? 'lead' : 'leads'} found
          </h2>
          <p className="text-[13px] text-muted-foreground">Every email has been tested. Send your pitch with confidence.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border hover:border-primary/50 text-card-foreground text-[13px] font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 gap-3">
        {leads.map((lead, i) => (
          <div key={i} className="card-premium p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-bold text-[15px] text-foreground truncate">{lead.company_name}</h3>
                  {lead.is_catchall && (
                    <span className="px-2 py-0.5 rounded-md bg-warning/15 text-warning text-[10px] font-bold uppercase">
                      Catch-All
                    </span>
                  )}
                </div>
                {lead.website_url && lead.website_url !== 'ABSENT' && (
                  <a
                    href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-primary hover:text-primary/80 transition-colors"
                  >
                    {lead.website_url}
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {lead.dm_name && lead.dm_name !== 'ABSENT' && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="text-foreground">{lead.dm_name}</span>
                  {lead.dm_position && lead.dm_position !== 'ABSENT' && (
                    <span className="text-muted-foreground">· {lead.dm_position}</span>
                  )}
                </div>
              )}
              {lead.verified_email && lead.verified_email !== 'ABSENT' && (
                <div className="flex items-center gap-2 text-[13px]">
                  <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-foreground truncate">{lead.verified_email}</span>
                </div>
              )}
              {lead.phone && lead.phone !== 'ABSENT' && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="text-foreground">{lead.phone}</span>
                </div>
              )}
              {lead.linkedin && lead.linkedin !== 'ABSENT' && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-muted-foreground">LinkedIn:</span>
                  <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 truncate">
                    {lead.linkedin}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// COLLECTIONS VIEW
// ============================================================
function CollectionsView({ collections }: { collections: any[] }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Your Collections</h1>
        <p className="text-[14px] text-muted-foreground">Every search you run gets saved here for later.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {collections.map((col, i) => (
            <div key={i} className="card-premium p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-bold text-primary uppercase">
                  {col.task_type}
                </span>
                <span className="text-[12px] text-muted-foreground">{col.created_at}</span>
              </div>
              <h3 className="font-semibold text-[15px] text-foreground mb-1 truncate">{col.name}</h3>
              <p className="text-[13px] text-muted-foreground">{col.lead_count} leads</p>
            </div>
          ))}
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
            href="/pricing"
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
