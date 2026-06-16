'use client'

/**
 * DASHBOARD — Bad Decision AI
 * Completely rebuilt. Premium dark design. All bugs fixed.
 *
 * Fixes:
 * - selectedCountry/selectedState properly declared as state
 * - Coin balance fetched on mount and after payment
 * - Search sends correct params to backend
 * - Location selector with continent/country/state cascade
 * - Fully responsive (mobile, tablet, desktop)
 * - Payment via Paystack inline popup
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useAppStore, type EngineType, type Lead } from '@/stores/app-store'
import { startSearch, pollUntilComplete, fetchCoinBalance, verifyPayment, fetchCollections } from '@/lib/api'
import { TIERS, COIN_ADDONS, type TierId, getTierById, formatAddonPrice } from '@/lib/pricing'
import { getCountryByCode } from '@/lib/locations'
import { LocationSelector } from '@/components/location-selector'
import { exportLeadsToCsv, downloadCsv } from '@/lib/csv-shield'

type DashView = 'search' | 'collections' | 'coins' | 'support'

const ENGINE_CARDS = [
  {
    id: 'ads_intent' as EngineType,
    title: 'Companies Running Ads',
    desc: 'Find businesses spending money on ads right now.',
    coinCost: 2,
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  },
  {
    id: 'smb_maps' as EngineType,
    title: 'Local Businesses',
    desc: 'Find shops, clinics, and offices with real addresses.',
    coinCost: 2,
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 'web_absent' as EngineType,
    title: 'Businesses Without Websites',
    desc: 'Find businesses that need a website built.',
    coinCost: 2,
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  },
  {
    id: 'social_intent' as EngineType,
    title: 'People Asking For Help',
    desc: 'Find people who want to buy right now.',
    coinCost: 2,
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
]

export function DashboardShell() {
  const router = useRouter()
  const { isSignedIn, isLoaded, userId } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()

  const {
    coinBalance, setCoinBalance,
    tier,
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // ===== FETCH COIN BALANCE ON MOUNT =====
  const loadBalance = useCallback(async () => {
    if (!userId) return
    try {
      const balance = await fetchCoinBalance()
      setCoinBalance({
        coins_balance: balance.coins_balance ?? 0,
        coins_reserved: balance.coins_reserved ?? 0,
        coins_lifetime: balance.coins_lifetime ?? 0,
      })
    } catch (err) {
      console.warn('[Dashboard] Failed to fetch coin balance:', err)
    }
  }, [userId, setCoinBalance])

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
    setProgress(0)

    try {
      const searchResult = await startSearch(
        selectedEngine,
        searchQuery.trim(),
        selectedCountry,
        selectedState
      )

      if (!searchResult.task_id) {
        throw new Error(searchResult.message || searchResult.detail || 'No task ID returned')
      }

      const finalStatus = await pollUntilComplete(
        searchResult.task_id,
        (status) => {
          if (status.status === 'processing') {
            setProgress(prev => Math.min(prev + 10, 90))
          }
        }
      )

      if (finalStatus.status === 'completed') {
        setLeads(finalStatus.leads || [])
        setSearchStatus('completed')
        setProgress(100)
      } else if (finalStatus.status === 'exhausted') {
        setSearchStatus('exhausted')
      } else if (finalStatus.status === 'failed') {
        setSearchStatus('failed')
        setSearchError(finalStatus.error || finalStatus.detail || 'Search failed. Try again.')
      }

      // Refresh balance after search (coins were deducted)
      loadBalance()
    } catch (err: any) {
      console.error('[Dashboard] Search error:', err)
      setSearchStatus('failed')
      setSearchError(err.message || 'Something went wrong. Try again.')
    }
  }, [selectedEngine, searchQuery, selectedCountry, selectedState, loadBalance])

  // ===== HANDLE PAYMENT (Paystack) =====
  const handleBuyCoins = (addon: typeof COIN_ADDONS[0]) => {
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
            coins: addon.coins,
            type: 'coin_addon',
          },
          callback: (response: any) => {
            const reference = response?.reference || ''
            if (reference) {
              verifyPayment(reference).then((result) => {
                if (result.verified && result.balance) {
                  setCoinBalance({
                    coins_balance: result.balance.coins_balance ?? 0,
                    coins_reserved: result.balance.coins_reserved ?? 0,
                    coins_lifetime: result.balance.coins_lifetime ?? 0,
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

  const handleSignOut = () => {
    signOut(() => router.push('/'))
  }

  const selectedCountryData = getCountryByCode(selectedCountry)

  // ===== LOADING STATE =====
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#08080C] flex items-center justify-center">
        <div className="text-[#A8A8B8] text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080C] text-[#F5F5F7]">
      <Script src="https://js.paystack.co/v2/inline.js" />

      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0E0E14] border-b border-[#25252F] h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[#1A1A24] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center">
              <span className="text-white font-bold text-xs">BD</span>
            </div>
            <span className="font-bold text-[14px]">Bad Decision</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1535] border border-[#7C5CFC]/20">
          <svg className="w-4 h-4 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="text-[13px] font-bold text-[#F5F5F7]">{coinBalance.coins_balance}</span>
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
          h-screen w-72 flex-shrink-0
          bg-[#0E0E14] border-r border-[#25252F]
          flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo */}
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-[#25252F]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#7C5CFC]/20">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <div>
              <div className="font-bold text-[15px] text-[#F5F5F7]">Bad Decision</div>
              <div className="text-[10px] text-[#6B6B7B] uppercase tracking-wide">Lead Intelligence</div>
            </div>
          </div>

          {/* Coin Balance Card */}
          <div className="p-4">
            <div className="rounded-xl bg-gradient-to-br from-[#1A1535] to-[#14141C] border border-[#7C5CFC]/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#A8A8B8] uppercase tracking-wide font-medium">Coins Remaining</span>
                <svg className="w-4 h-4 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-[#F5F5F7]">{coinBalance.coins_balance}</div>
              <div className="text-[12px] text-[#6B6B7B] mt-1">{coinBalance.coins_reserved} reserved</div>
              <button
                onClick={() => { setActiveView('coins'); setSidebarOpen(false) }}
                className="w-full mt-3 py-2 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-[13px] font-semibold transition-colors"
              >
                Get More Coins
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
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
              label="Coin Vault"
              active={activeView === 'coins'}
              onClick={() => { setActiveView('coins'); setSidebarOpen(false) }}
            />
            <NavItem
              icon="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              label="Support"
              active={activeView === 'support'}
              onClick={() => { setActiveView('support'); setSidebarOpen(false) }}
            />
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-[#25252F]">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-[#F5F5F7] truncate">
                  {user?.firstName || user?.fullName || 'Account'}
                </div>
                <div className="text-[11px] text-[#6B6B7B] uppercase tracking-wide">{tier} plan</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#F87171] hover:bg-[#2A1010] text-[13px] font-medium transition-colors"
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
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
              onSearch={handleSearch}
              coinBalance={coinBalance.coins_balance}
            />
          )}
          {activeView === 'collections' && (
            <CollectionsView collections={collections} />
          )}
          {activeView === 'coins' && (
            <CoinsView
              coinBalance={coinBalance}
              tier={tier}
              onBuyCoins={handleBuyCoins}
              paymentProcessing={paymentProcessing}
              paymentError={paymentError}
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
          ? 'bg-[#1A1535] text-[#F5F5F7] border border-[#7C5CFC]/20'
          : 'text-[#A8A8B8] hover:text-[#F5F5F7] hover:bg-[#14141C]'
      }`}
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
      </svg>
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 rounded-md bg-[#7C5CFC]/20 text-[#7C5CFC] text-[11px] font-bold">
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
  searchStatus, searchError, leads, progress, onSearch, coinBalance
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
  onSearch: () => void
  coinBalance: number
}) {
  const activeEngine = ENGINE_CARDS.find(e => e.id === selectedEngine)
  const canSearch = selectedEngine && searchQuery.trim() && searchStatus !== 'processing'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-1">Find Real Buyers</h1>
        <p className="text-[14px] text-[#A8A8B8]">Type what you want. Pick a location. Hit search. Get verified contacts.</p>
      </div>

      {/* Engine Selection */}
      <div>
        <label className="block text-[12px] font-medium text-[#A8A8B8] mb-3 uppercase tracking-wide">
          What do you want to find?
        </label>
        {selectedEngine ? (
          <div className="card-premium p-4 mb-3 border-[#7C5CFC]/30">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#1A1535] border border-[#7C5CFC]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={activeEngine?.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[15px] text-[#F5F5F7] truncate">{activeEngine?.title}</div>
                  <div className="text-[12px] text-[#A8A8B8] truncate">{activeEngine?.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2.5 py-1 rounded-md bg-[#1A1535] text-[12px] font-bold text-[#7C5CFC]">
                  {activeEngine?.coinCost} coins
                </span>
                <button
                  onClick={() => setSelectedEngine(null)}
                  className="p-1.5 rounded-md hover:bg-[#1A1A24] text-[#6B6B7B] hover:text-[#F5F5F7] transition-colors"
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
            {ENGINE_CARDS.map(engine => (
              <button
                key={engine.id}
                onClick={() => setSelectedEngine(engine.id)}
                className="card-premium p-4 text-left hover:border-[#7C5CFC]/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1535] border border-[#7C5CFC]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#7C5CFC] group-hover:border-[#7C5CFC] transition-all">
                    <svg className="w-5 h-5 text-[#7C5CFC] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={engine.icon} />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-[14px] text-[#F5F5F7]">{engine.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#1A1535] text-[11px] font-bold text-[#7C5CFC] flex-shrink-0">
                        {engine.coinCost} coins
                      </span>
                    </div>
                    <p className="text-[12px] text-[#A8A8B8]">{engine.desc}</p>
                  </div>
                </div>
              </button>
            ))}
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
            <label className="block text-[12px] font-medium text-[#A8A8B8] mb-1.5 uppercase tracking-wide">
              What are you looking for?
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canSearch && onSearch()}
              placeholder="e.g. roofers, bakeries, dentists, plumbers..."
              className="w-full px-4 py-3 rounded-lg bg-[#08080C] border border-[#25252F] focus:border-[#7C5CFC] text-[#F5F5F7] text-[15px] outline-none transition-colors"
            />
          </div>

          {searchError && (
            <div className="rounded-lg bg-[#2A1010] border border-[#F87171]/20 p-3">
              <p className="text-[13px] text-[#F87171]">{searchError}</p>
            </div>
          )}

          <button
            onClick={onSearch}
            disabled={!canSearch}
            className="w-full py-3.5 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white font-semibold text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7C5CFC]/20"
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
                Search · {activeEngine?.coinCost} coins
                <span className="text-[12px] opacity-70">(You have {coinBalance})</span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {searchStatus === 'processing' && (
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] text-[#A8A8B8]">Scanning the live internet...</span>
            <span className="text-[13px] text-[#7C5CFC] font-semibold">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#08080C] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C5CFC] to-[#3B82F6] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[12px] text-[#6B6B7B] mt-2">
            We are finding real businesses and testing every email. This takes a few minutes.
          </p>
        </div>
      )}

      {/* Results */}
      {searchStatus === 'completed' && (
        <ResultsView leads={leads} engineType={selectedEngine} />
      )}

      {searchStatus === 'exhausted' && (
        <div className="card-premium p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2A2008] border border-[#FBBF24]/20 mb-4">
            <svg className="w-7 h-7 text-[#FBBF24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#F5F5F7] mb-2">No leads found this time.</h3>
          <p className="text-[14px] text-[#A8A8B8] max-w-md mx-auto">
            We searched but could not find enough verified businesses matching your query.
            Try a different search term or a different location. Your coins were not spent.
          </p>
        </div>
      )}

      {searchStatus === 'failed' && (
        <div className="card-premium p-8 text-center border-[#F87171]/20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2A1010] border border-[#F87171]/20 mb-4">
            <svg className="w-7 h-7 text-[#F87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#F5F5F7] mb-2">Search failed.</h3>
          <p className="text-[14px] text-[#A8A8B8] mb-4">{searchError}</p>
          <button
            onClick={onSearch}
            className="px-6 py-2.5 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-[14px] font-semibold transition-colors"
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
          <h2 className="text-xl font-bold text-[#F5F5F7]">
            {leads.length} verified {leads.length === 1 ? 'lead' : 'leads'} found
          </h2>
          <p className="text-[13px] text-[#A8A8B8]">Every email has been tested. Send your pitch with confidence.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#14141C] border border-[#25252F] hover:border-[#3D3D4A] text-[#F5F5F7] text-[13px] font-semibold transition-colors"
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
                  <h3 className="font-bold text-[15px] text-[#F5F5F7] truncate">{lead.company_name}</h3>
                  {lead.is_catchall && (
                    <span className="px-2 py-0.5 rounded-md bg-[#2A2008] text-[#FBBF24] text-[10px] font-bold uppercase">
                      Catch-All
                    </span>
                  )}
                </div>
                {lead.website_url && lead.website_url !== 'ABSENT' && (
                  <a
                    href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-[#7C5CFC] hover:text-[#6B4CE6] transition-colors"
                  >
                    {lead.website_url}
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {lead.dm_name && lead.dm_name !== 'ABSENT' && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-[#6B6B7B]">Contact:</span>
                  <span className="text-[#F5F5F7]">{lead.dm_name}</span>
                  {lead.dm_position && lead.dm_position !== 'ABSENT' && (
                    <span className="text-[#6B6B7B]">· {lead.dm_position}</span>
                  )}
                </div>
              )}
              {lead.verified_email && lead.verified_email !== 'ABSENT' && (
                <div className="flex items-center gap-2 text-[13px]">
                  <svg className="w-3.5 h-3.5 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#F5F5F7] truncate">{lead.verified_email}</span>
                </div>
              )}
              {lead.phone && lead.phone !== 'ABSENT' && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-[#6B6B7B]">Phone:</span>
                  <span className="text-[#F5F5F7]">{lead.phone}</span>
                </div>
              )}
              {lead.linkedin && lead.linkedin !== 'ABSENT' && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-[#6B6B7B]">LinkedIn:</span>
                  <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#7C5CFC] hover:text-[#6B4CE6] truncate">
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-1">Your Collections</h1>
        <p className="text-[14px] text-[#A8A8B8]">Every search you run gets saved here for later.</p>
      </div>

      {collections.length === 0 ? (
        <div className="card-premium p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 mb-4">
            <svg className="w-7 h-7 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#F5F5F7] mb-2">No collections yet.</h3>
          <p className="text-[14px] text-[#A8A8B8] max-w-sm mx-auto">
            Run a search and your results will be saved here automatically. Come back anytime to review your leads.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {collections.map((col, i) => (
            <div key={i} className="card-premium p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md bg-[#1A1535] text-[11px] font-bold text-[#7C5CFC] uppercase">
                  {col.task_type}
                </span>
                <span className="text-[12px] text-[#6B6B7B]">{col.created_at}</span>
              </div>
              <h3 className="font-semibold text-[15px] text-[#F5F5F7] mb-1 truncate">{col.name}</h3>
              <p className="text-[13px] text-[#A8A8B8]">{col.lead_count} leads</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// COINS VIEW
// ============================================================
function CoinsView({
  coinBalance, tier, onBuyCoins, paymentProcessing, paymentError
}: {
  coinBalance: { coins_balance: number; coins_reserved: number; coins_lifetime: number }
  tier: string
  onBuyCoins: (addon: any) => void
  paymentProcessing: boolean
  paymentError: string
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-1">Coin Vault</h1>
        <p className="text-[14px] text-[#A8A8B8]">Your coin balance and purchase history. Buy more coins anytime.</p>
      </div>

      {/* Balance Card */}
      <div className="card-premium p-6 bg-gradient-to-br from-[#14141C] to-[#1A1535] border-[#7C5CFC]/20">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] text-[#A8A8B8] uppercase tracking-wide mb-1">Available</div>
            <div className="text-3xl font-bold text-[#F5F5F7]">{coinBalance.coins_balance}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#A8A8B8] uppercase tracking-wide mb-1">Reserved</div>
            <div className="text-3xl font-bold text-[#A8A8B8]">{coinBalance.coins_reserved}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#A8A8B8] uppercase tracking-wide mb-1">Lifetime</div>
            <div className="text-3xl font-bold text-[#A8A8B8]">{coinBalance.coins_lifetime}</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#25252F]">
          <span className="text-[12px] text-[#6B6B7B]">Current plan: </span>
          <span className="text-[12px] text-[#7C5CFC] font-semibold uppercase">{tier}</span>
        </div>
      </div>

      {/* Error */}
      {paymentError && (
        <div className="rounded-xl bg-[#2A1010] border border-[#F87171]/20 p-4">
          <p className="text-[14px] text-[#F87171]">{paymentError}</p>
        </div>
      )}

      {/* Buy Coins */}
      <div>
        <h2 className="text-lg font-bold text-[#F5F5F7] mb-3">Buy More Coins</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COIN_ADDONS.map(addon => (
            <div key={addon.id} className="card-premium p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1A1535] border border-[#7C5CFC]/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gradient-violet">{addon.coins.toLocaleString()}</div>
              <div className="text-[12px] text-[#6B6B7B] mb-3">coins</div>
              <div className="text-lg font-bold text-[#F5F5F7] mb-4">
                ₦{addon.priceNGN.toLocaleString()}
              </div>
              <button
                onClick={() => onBuyCoins(addon)}
                disabled={paymentProcessing}
                className="w-full py-2.5 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
              >
                {paymentProcessing ? 'Please wait...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Plan */}
      <div>
        <h2 className="text-lg font-bold text-[#F5F5F7] mb-3">Or Upgrade Your Plan</h2>
        <div className="card-premium p-5">
          <p className="text-[14px] text-[#A8A8B8] mb-4">
            Plans give you coins every month at a better price. Plus more search engines and higher daily limits.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#14141C] border border-[#25252F] hover:border-[#3D3D4A] text-[#F5F5F7] text-[14px] font-semibold transition-colors"
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-1">Support</h1>
        <p className="text-[14px] text-[#A8A8B8]">Need help? We answer fast.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-premium p-6">
          <div className="w-12 h-12 rounded-xl bg-[#1A1535] flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#F5F5F7] mb-2">Email Us</h3>
          <p className="text-[14px] text-[#A8A8B8] mb-3">A real person reads every email. Usually replies within a few hours.</p>
          <a href="mailto:support@baddecision.ai" className="text-[#7C5CFC] hover:text-[#6B4CE6] font-semibold text-[14px]">
            support@baddecision.ai
          </a>
        </div>

        <div className="card-premium p-6">
          <div className="w-12 h-12 rounded-xl bg-[#1A1535] flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#F5F5F7] mb-2">FAQ</h3>
          <p className="text-[14px] text-[#A8A8B8] mb-3">Most questions are already answered on our FAQ page.</p>
          <a href="/faq" className="text-[#7C5CFC] hover:text-[#6B4CE6] font-semibold text-[14px]">
            Read FAQ →
          </a>
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="text-lg font-bold text-[#F5F5F7] mb-3">Quick Tips</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-[#7C5CFC] font-bold flex-shrink-0">1.</span>
            <p className="text-[14px] text-[#A8A8B8]">Be specific in your search. "Roofers in Dallas" works better than just "roofers".</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#7C5CFC] font-bold flex-shrink-0">2.</span>
            <p className="text-[14px] text-[#A8A8B8]">Pick the right engine. If you sell websites, use "Businesses Without Websites".</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#7C5CFC] font-bold flex-shrink-0">3.</span>
            <p className="text-[14px] text-[#A8A8B8]">Export your leads right away. Save them to your computer so you always have them.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#7C5CFC] font-bold flex-shrink-0">4.</span>
            <p className="text-[14px] text-[#A8A8B8]">Send your pitch the same day you get leads. Fresh contacts respond better.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
