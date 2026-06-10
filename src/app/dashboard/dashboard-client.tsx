'use client'

/**
 * DASHBOARD CLIENT — The Matrix Shell (Rewritten)
 * Persistent split-pane workspace with mobile responsive support.
 * Left sidebar: Smart Collections + profile (collapsible on mobile).
 * Main canvas: Idle Hub, Command HUD, Results, Coin Vault, Support.
 * Real backend API integration for search + coin balance.
 *
 * Search UX Redesign:
 * - When engine selected: compact bar (icon + name + coin cost badge)
 * - Other engines show as pill/chip buttons in a row below
 * - Search form appears directly below — no scrolling needed
 * - Location selector with country flags and state dropdown
 *
 * Payment: Import TIERS and COIN_ADDONS from @/lib/pricing
 * Use Paystack inline popup v2 directly (NOT backend /api/paystack/initialize)
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import Script from 'next/script'
import { useAppStore, type AppView, type EngineType, type Lead } from '@/stores/app-store'
import { startSearch, pollUntilComplete, fetchCoinBalance } from '@/lib/api'
import { TIERS, COIN_ADDONS, type TierId, getTierById, formatPrice, formatAddonPrice, isEngineAvailable } from '@/lib/pricing'
import { COUNTRIES, getStates, searchCountries, getPopularCountries, countryCodeToFlag } from '@/lib/locations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { exportLeadsToCsv, downloadCsv } from '@/lib/csv-shield'

// ============================================================
// ENGINE CONFIG
// ============================================================
const ENGINE_CARDS = [
  {
    id: 'ads_intent' as EngineType,
    title: 'Companies Running Ads',
    desc: 'Find businesses with marketing budgets.',
    coinCost: 2,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    id: 'smb_maps' as EngineType,
    title: 'Local Businesses',
    desc: 'Find local shops, agencies, and clinics.',
    coinCost: 2,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'web_absent' as EngineType,
    title: 'Businesses Without Websites',
    desc: 'Find businesses that need a website built.',
    coinCost: 2,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    id: 'social_intent' as EngineType,
    title: 'People Asking For Help',
    desc: 'Find people who want to buy right now.',
    coinCost: 2,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

// ============================================================
// MAIN SHELL
// ============================================================
export function DashboardShell() {
  const {
    view, setView,
    tier, coinBalance, setCoinBalance,
    selectedEngine, setSelectedEngine,
    searchQuery, setSearchQuery,
    taskStatus, setTaskStatus,
    leads, setLeads,
    collections,
    selectedLead, setSelectedLead,
    inspectorOpen, setInspectorOpen,
  } = useAppStore()

  const { signOut } = useClerk()
  const { userId } = useAuth()

  const isNigeria = useAppStore((s) => s.userCountry) === 'NG'
  const userCountry = useAppStore((s) => s.userCountry)

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeSubView: 'idle' | 'searching' | 'results' | 'coin-vault' | 'support' =
    view === 'dashboard-coin-vault' ? 'coin-vault' :
    view === 'dashboard-support' ? 'support' :
    view === 'dashboard-results' ? 'results' :
    view === 'dashboard-searching' ? 'searching' : 'idle'

  // Fetch real coin balance on mount
  useEffect(() => {
    if (userId) {
      fetchCoinBalance().then(balance => {
        setCoinBalance({
          coins_balance: balance.coins_balance ?? 0,
          coins_reserved: balance.coins_reserved ?? 0,
          coins_lifetime: balance.coins_lifetime ?? 0,
        })
      }).catch(err => {
        console.warn('[Dashboard] Failed to fetch coin balance:', err)
      })
    }
  }, [userId, setCoinBalance])

  // Handle search — real backend API call
  const handleSearch = useCallback(async () => {
    if (!selectedEngine || !searchQuery.trim()) return

    setView('dashboard-searching')
    setTaskStatus('processing')
    setLeads([])

    try {
      const searchResult = await startSearch(selectedEngine, searchQuery)

      if (!searchResult.task_id) {
        throw new Error(searchResult.message || searchResult.detail || 'No task ID returned from backend')
      }

      const finalStatus = await pollUntilComplete(
        searchResult.task_id,
        (status) => {
          if (status.status === 'processing') {
            setTaskStatus('processing')
          }
        }
      )

      if (finalStatus.status === 'completed' && finalStatus.leads && finalStatus.leads.length > 0) {
        setLeads(finalStatus.leads)
        setTaskStatus('completed')
        setView('dashboard-results')
      } else if (finalStatus.status === 'exhausted') {
        setLeads(finalStatus.leads || [])
        setTaskStatus('exhausted')
        setView('dashboard-results')
      } else if (finalStatus.status === 'failed') {
        setTaskStatus('failed')
        setView('dashboard-idle')
        alert('Search failed: ' + (finalStatus.error || finalStatus.detail || 'Unknown error'))
      } else {
        setLeads([])
        setTaskStatus('completed')
        setView('dashboard-results')
      }

      try {
        const balance = await fetchCoinBalance()
        setCoinBalance({
          coins_balance: balance.coins_balance ?? 0,
          coins_reserved: balance.coins_reserved ?? 0,
          coins_lifetime: balance.coins_lifetime ?? 0,
        })
      } catch {}

    } catch (err: any) {
      console.error('[Dashboard] Search error:', err)
      setTaskStatus('failed')
      setView('dashboard-idle')
      alert('Search error: ' + (err.message || 'Something went wrong. Please try again.'))
    }
  }, [selectedEngine, searchQuery, setView, setTaskStatus, setLeads, setCoinBalance])

  const handleExport = () => {
    const csv = exportLeadsToCsv(leads, selectedEngine || undefined)
    downloadCsv(csv, `bad-decision-leads-${Date.now()}.csv`)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
    setView('landing')
  }

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-semibold text-[#0F172A] text-sm">Bad Decision AI</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center">
            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Coin Balance */}
        <div className="px-4 py-4">
          <div className="rounded-xl bg-[#0B1120] p-4">
            <p className="text-xs text-[#94A3B8] uppercase tracking-wide font-medium">Coins Remaining</p>
            <p className="text-2xl font-bold text-white mt-1">{coinBalance.coins_balance}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{coinBalance.coins_reserved} reserved</p>
          </div>
        </div>

        {/* Smart Collections */}
        <div className="flex-1 overflow-y-auto px-4">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-3">Smart Collections</p>
          <div className="space-y-1">
            {collections.length === 0 ? (
              <p className="text-xs text-[#94A3B8] px-3 py-2">No collections yet. Run a search to create one.</p>
            ) : (
              collections.map((col) => (
                <button
                  key={col.id}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white text-sm text-[#0F172A] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="truncate">{col.name}</span>
                  <span className="ml-auto text-xs text-[#64748B]">{col.lead_count}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Bottom: Navigation + Profile */}
        <div className="border-t border-[#E2E8F0] p-4 space-y-1">
          <button
            onClick={() => { setView('dashboard-coin-vault'); setSidebarOpen(false) }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeSubView === 'coin-vault' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'text-[#0F172A] hover:bg-white'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Coin Vault
          </button>
          <button
            onClick={() => { setView('dashboard-support'); setSidebarOpen(false) }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeSubView === 'support' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'text-[#0F172A] hover:bg-white'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Support
          </button>
          <Separator className="bg-[#E2E8F0] my-2" />
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#DC2626] hover:bg-[#FEE2E2] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Nav */}
        <div className="h-14 border-b border-[#E2E8F0] flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button onClick={() => setView('dashboard-idle')} className="flex items-center gap-2 text-[#0F172A]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Badge tier={tier} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={leads.length === 0}
              className="border-[#E2E8F0] text-[#0F172A] disabled:text-[#94A3B8] disabled:border-[#F1F5F9]"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Canvas Content */}
        <div className="flex-1 overflow-y-auto">
          {activeSubView === 'idle' && (
            <IdleWorkspace
              onSelectEngine={(engine) => setSelectedEngine(engine)}
              selectedEngine={selectedEngine}
              onSearch={handleSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              tier={tier}
              userCountry={userCountry}
            />
          )}
          {activeSubView === 'searching' && (
            <SearchingView engine={selectedEngine} query={searchQuery} />
          )}
          {activeSubView === 'results' && (
            <ResultsMatrix
              leads={leads}
              onSelectLead={(lead) => {
                setSelectedLead(lead)
                setInspectorOpen(true)
              }}
            />
          )}
          {activeSubView === 'coin-vault' && <CoinVault />}
          {activeSubView === 'support' && <SupportTerminal />}
        </div>
      </main>

      {/* CANVAS INSPECTOR */}
      {inspectorOpen && selectedLead && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 xl:hidden"
            onClick={() => setInspectorOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] xl:relative xl:w-[30%] xl:min-w-[360px] bg-[#F8FAFC] border-l border-[#E2E8F0] flex flex-col overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0F172A]">Contact Details</h2>
                <button onClick={() => setInspectorOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <DataField label="Company" value={selectedLead.company_name} />
                <DataField label="Website" value={selectedLead.website_url} isLink />
                <DataField label="Decision Maker" value={selectedLead.dm_name} />
                <DataField label="Position" value={selectedLead.dm_position} />
                <DataField label="Verified Email" value={selectedLead.verified_email} />
                <DataField label="Phone" value={selectedLead.phone} />
                <DataField label="LinkedIn" value={selectedLead.linkedin} isLink />
                <DataField label="Instagram" value={selectedLead.instagram} isLink />
                {selectedLead.ad_platform && selectedLead.ad_platform !== 'ABSENT' && (
                  <DataField label="Ad Platform" value={selectedLead.ad_platform} />
                )}
                {selectedLead.address && selectedLead.address !== 'ABSENT' && (
                  <DataField label="Address" value={selectedLead.address} />
                )}
                {selectedLead.aggregator_source && selectedLead.aggregator_source !== 'ABSENT' && (
                  <DataField label="Aggregator" value={selectedLead.aggregator_source} />
                )}
                {selectedLead.platform && selectedLead.platform !== 'ABSENT' && (
                  <DataField label="Platform" value={selectedLead.platform} />
                )}
                <Separator className="bg-[#E2E8F0]" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span className="text-sm text-[#0F172A] font-medium">Live Network Status: Active</span>
                  </div>
                  {selectedLead.verified_email !== 'ABSENT' && (
                    <div className="flex items-center gap-2">
                      {selectedLead.is_catchall ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-[#D97706]" />
                          <span className="text-sm text-[#D97706] font-medium">Inbox Handshake: Catch-All Detected</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
                          <span className="text-sm text-[#0F172A] font-medium">Inbox Handshake: Verified</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Paystack Script */}
      <Script src="https://js.paystack.co/v2/inline.js" />
    </div>
  )
}

// ============================================================
// IDLE WORKSPACE — REDESIGNED Search UX
// ============================================================
function IdleWorkspace({
  onSelectEngine,
  selectedEngine,
  onSearch,
  searchQuery,
  setSearchQuery,
  tier,
  userCountry,
}: {
  onSelectEngine: (e: EngineType) => void
  selectedEngine: EngineType | null
  onSearch: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  tier: string
  userCountry: string
}) {
  const [searchError, setSearchError] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(userCountry || 'NG')
  const [selectedState, setSelectedState] = useState('')
  const [locationOpen, setLocationOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const locationRef = useRef<HTMLDivElement>(null)

  const currentEngine = ENGINE_CARDS.find(e => e.id === selectedEngine)
  const otherEngines = ENGINE_CARDS.filter(e => e.id !== selectedEngine)
  const states = getStates(selectedCountry)

  // Close location dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Check if engine is available for current tier
  const engineAvailable = (id: EngineType) => isEngineAvailable(id, tier as TierId)

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl">
        {/* If no engine selected — show engine cards */}
        {!selectedEngine ? (
          <>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] text-center">What Are You Looking For?</h1>
            <p className="text-[#64748B] text-center mt-2 mb-8 sm:mb-10">Select a target type to begin your search.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ENGINE_CARDS.map((engine) => {
                const available = engineAvailable(engine.id)
                return (
                  <button
                    key={engine.id}
                    onClick={() => {
                      if (available) {
                        onSelectEngine(engine.id)
                        setSearchError('')
                      } else {
                        setSearchError('Upgrade your plan to unlock this engine.')
                      }
                    }}
                    className={`group rounded-2xl border-2 bg-white p-6 sm:p-8 text-left transition-all ${
                      available
                        ? 'border-[#E2E8F0] hover:border-[#2563EB]'
                        : 'border-[#E2E8F0] opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      available
                        ? 'bg-[#F8FAFC] group-hover:bg-[#DBEAFE] text-[#64748B] group-hover:text-[#2563EB]'
                        : 'bg-[#F8FAFC] text-[#94A3B8]'
                    }`}>
                      {engine.icon}
                    </div>
                    <h3 className="font-semibold text-[#0F172A]">{engine.title}</h3>
                    <p className="text-sm text-[#64748B] mt-1">{engine.desc}</p>
                    {!available && (
                      <span className="inline-block mt-2 text-xs font-medium text-[#D97706] bg-[#FEF08A] rounded-full px-3 py-0.5">
                        Upgrade Required
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          /* Engine selected — compact search UX */
          <div className="space-y-4">
            {/* Selected engine bar */}
            <div className="flex items-center gap-3 rounded-xl border-2 border-[#2563EB] bg-[#DBEAFE]/30 px-4 py-3">
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0">
                {currentEngine?.icon}
              </div>
              <span className="font-semibold text-[#0F172A] flex-1">{currentEngine?.title}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2563EB] text-white text-xs font-medium px-2.5 py-1">
                {currentEngine?.coinCost} coins
              </span>
              <button
                onClick={() => onSelectEngine(null as any)}
                className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-[#64748B] hover:text-[#0F172A]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Other engines as pills */}
            <div className="flex flex-wrap gap-2">
              {otherEngines.map((engine) => {
                const available = engineAvailable(engine.id)
                return (
                  <button
                    key={engine.id}
                    onClick={() => {
                      if (available) {
                        onSelectEngine(engine.id)
                        setSearchError('')
                      } else {
                        setSearchError('Upgrade your plan to unlock this engine.')
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all ${
                      available
                        ? 'border-[#E2E8F0] text-[#0F172A] hover:border-[#2563EB] hover:bg-[#DBEAFE]/30'
                        : 'border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                    }`}
                  >
                    {engine.icon}
                    <span className="font-medium">{engine.title}</span>
                    {!available && (
                      <svg className="w-3.5 h-3.5 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-6a8 8 0 11-16 0 8 8 0 0116 0z" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Error */}
            {searchError && (
              <div className="rounded-lg bg-[#FEE2E2] border border-[#DC2626]/20 p-3">
                <p className="text-sm text-[#DC2626]">{searchError}</p>
              </div>
            )}

            {/* Search form */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input
                  placeholder="Type what you need: Plumbers in Texas..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                  className="flex-1 h-[52px] border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-base rounded-xl"
                  autoFocus
                />
                <Button onClick={onSearch} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 sm:px-8 h-[52px] font-semibold rounded-xl">
                  Search
                </Button>
              </div>

              {/* Location selector */}
              <div className="flex gap-3" ref={locationRef}>
                <div className="relative flex-1">
                  <button
                    onClick={() => setLocationOpen(!locationOpen)}
                    className="w-full flex items-center gap-2 h-11 border-2 border-[#E2E8F0] rounded-xl px-3 text-sm text-left bg-white hover:border-[#2563EB] transition-colors"
                  >
                    <span className="text-base">
                      {COUNTRIES.find(c => c.code === selectedCountry)?.flag || ''}
                    </span>
                    <span className="flex-1 truncate text-[#0F172A]">
                      {COUNTRIES.find(c => c.code === selectedCountry)?.name || 'Select Country'}
                    </span>
                    {selectedState && (
                      <span className="text-[#64748B] truncate">/ {states.find(s => s.code === selectedState)?.name || selectedState}</span>
                    )}
                    <svg className="w-4 h-4 text-[#64748B] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {locationOpen && (
                    <div className="absolute z-50 top-full mt-1 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-80 overflow-hidden">
                      {/* Search */}
                      <div className="p-2 border-b border-[#E2E8F0]">
                        <Input
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="h-9 border-[#E2E8F0] text-sm"
                          autoFocus
                        />
                      </div>

                      <div className="overflow-y-auto max-h-64">
                        {/* Popular countries */}
                        {!countrySearch && (
                          <>
                            <p className="px-3 pt-2 pb-1 text-xs font-semibold text-[#64748B] uppercase">Popular</p>
                            {getPopularCountries().map((c) => (
                              <button
                                key={c.code}
                                onClick={() => {
                                  setSelectedCountry(c.code)
                                  setSelectedState('')
                                  if (getStates(c.code).length === 0) setLocationOpen(false)
                                  setCountrySearch('')
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F8FAFC] transition-colors ${
                                  selectedCountry === c.code ? 'bg-[#DBEAFE] text-[#2563EB]' : 'text-[#0F172A]'
                                }`}
                              >
                                <span className="text-base">{c.flag}</span>
                                <span className="font-medium">{c.name}</span>
                              </button>
                            ))}
                            <div className="border-t border-[#E2E8F0] my-1" />
                          </>
                        )}

                        {/* Filtered countries */}
                        {searchCountries(countrySearch).map((c) => (
                          <button
                            key={c.code}
                            onClick={() => {
                              setSelectedCountry(c.code)
                              setSelectedState('')
                              if (getStates(c.code).length === 0) setLocationOpen(false)
                              setCountrySearch('')
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F8FAFC] transition-colors ${
                              selectedCountry === c.code ? 'bg-[#DBEAFE] text-[#2563EB]' : 'text-[#0F172A]'
                            }`}
                          >
                            <span className="text-base">{c.flag}</span>
                            <span className="font-medium">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* State/Region dropdown */}
                {states.length > 0 && (
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="h-11 border-2 border-[#E2E8F0] rounded-xl px-3 text-sm bg-white text-[#0F172A] hover:border-[#2563EB] transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none min-w-[140px]"
                  >
                    <option value="">All Regions</option>
                    {states.map((s) => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// SEARCHING VIEW
// ============================================================
function SearchingView({ engine, query }: { engine: EngineType | null; query: string }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Company</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Website</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Decision Maker</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Verified Email</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#E2E8F0] last:border-0">
                      <td className="px-4 py-4"><div className="h-4 bg-[#F1F5F9] rounded pulse-row w-32" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-[#F1F5F9] rounded pulse-row w-28" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-[#F1F5F9] rounded pulse-row w-24" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-[#F1F5F9] rounded pulse-row w-36" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0B1120] px-4 sm:px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <span className="text-[#2563EB] font-mono text-sm font-semibold">[ WORKING ]</span>
        <span className="text-[#94A3B8] font-mono text-sm hidden sm:inline">
          RUNNING LIVE INBOX TEST ON 25 TARGETS...
        </span>
        <span className="cursor-blink text-[#2563EB] font-mono">_</span>
      </div>
    </div>
  )
}

// ============================================================
// RESULTS MATRIX
// ============================================================
function ResultsMatrix({ leads, onSelectLead }: { leads: Lead[]; onSelectLead: (l: Lead) => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">Results</h2>
              <p className="text-sm text-[#64748B]">{leads.length} verified contacts found</p>
            </div>
          </div>

          {leads.length === 0 ? (
            <div className="rounded-xl border border-[#E2E8F0] p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F8FAFC] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2">No Contacts Found</h3>
              <p className="text-sm text-[#64748B]">Try a different search query or engine. Our system only returns verified contacts.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Company</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Website</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Decision Maker</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Position</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Verified Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, idx) => (
                      <tr
                        key={lead.domain_hash || idx}
                        onClick={() => onSelectLead(lead)}
                        className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">
                          {lead.company_name !== 'ABSENT' ? lead.company_name : <AbsentBadge />}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">
                          {lead.website_url !== 'ABSENT' ? lead.website_url : <AbsentBadge />}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {lead.dm_name !== 'ABSENT' ? (
                            <span className="text-[#0F172A]">{lead.dm_name}</span>
                          ) : (
                            <AbsentBadge />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {lead.dm_position !== 'ABSENT' ? (
                            <span className="text-[#64748B]">{lead.dm_position}</span>
                          ) : (
                            <AbsentBadge />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {lead.verified_email !== 'ABSENT' ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[#0F172A]">{lead.verified_email}</span>
                              {lead.is_catchall && <CatchAllBadge />}
                            </div>
                          ) : (
                            <AbsentBadge />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// COIN VAULT — with real Paystack integration using pricing.ts
// ============================================================
function CoinVault() {
  const { coinBalance, setCoinBalance, userCountry, tier, setTier, setView } = useAppStore()
  const { user } = useUser()
  const { userId } = useAuth()
  const isNigeria = userCountry === 'NG'

  const [paystackLoading, setPaystackLoading] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState('')

  const maxCoins = Math.max(coinBalance.coins_lifetime, 5000)
  const progress = Math.min((coinBalance.coins_balance / maxCoins) * 100, 100)

  // Plan upgrade handler using Paystack inline
  const handleUpgradePlan = (tierId: TierId) => {
    const tier = getTierById(tierId)
    if (tier.planType === 'free') return

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setPaymentError('Payment system is not configured. Please contact support.')
      return
    }

    setPaystackLoading(tierId)
    setPaymentError('')

    try {
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        const handler = (window as any).PaystackPop.setup({
          reference: crypto.randomUUID(),
          email: user?.primaryEmailAddress?.emailAddress || '',
          amount: tier.priceKobo,
          publicKey,
          currency: 'NGN',
          metadata: {
            user_id: userId || '',
            plan: tier.id,
            coins: tier.coins,
            custom_fields: [
              { display_name: 'Plan', variable_name: 'plan', value: tier.id },
              { display_name: 'Coins', variable_name: 'coins', value: tier.coins.toString() },
            ],
          },
          callback: () => {
            setTimeout(async () => {
              try {
                const balance = await fetchCoinBalance()
                setCoinBalance({
                  coins_balance: balance.coins_balance ?? 0,
                  coins_reserved: balance.coins_reserved ?? 0,
                  coins_lifetime: balance.coins_lifetime ?? 0,
                })
              } catch {}
            }, 3000)
            setTier(tierId)
            setPaystackLoading(null)
          },
          onClose: () => {
            setPaystackLoading(null)
          },
        })
        handler.openIframe()
      } else {
        setPaymentError('Payment system is loading. Please try again in a moment.')
        setPaystackLoading(null)
      }
    } catch (err) {
      console.error('[CoinVault] Paystack error:', err)
      setPaymentError('Payment failed. Please try again.')
      setPaystackLoading(null)
    }
  }

  // Coin addon handler using Paystack inline
  const handleBuyCoins = (addon: typeof COIN_ADDONS[0]) => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setPaymentError('Payment system is not configured. Please contact support.')
      return
    }

    setPaystackLoading(addon.id)
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
            custom_fields: [
              { display_name: 'Coins', variable_name: 'coins', value: addon.coins.toString() },
            ],
          },
          callback: () => {
            setTimeout(async () => {
              try {
                const balance = await fetchCoinBalance()
                setCoinBalance({
                  coins_balance: balance.coins_balance ?? 0,
                  coins_reserved: balance.coins_reserved ?? 0,
                  coins_lifetime: balance.coins_lifetime ?? 0,
                })
              } catch {}
            }, 3000)
            setPaystackLoading(null)
          },
          onClose: () => {
            setPaystackLoading(null)
          },
        })
        handler.openIframe()
      } else {
        setPaymentError('Payment system is loading. Please try again in a moment.')
        setPaystackLoading(null)
      }
    } catch (err) {
      console.error('[CoinVault] Paystack error:', err)
      setPaymentError('Payment failed. Please try again.')
      setPaystackLoading(null)
    }
  }

  const paidTiers = TIERS.filter(t => t.planType === 'paid')

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0F172A]">Coin Vault</h1>
      <p className="text-[#64748B] mt-1">Manage your coin balance and purchase top-ups.</p>

      {/* Payment Error Banner */}
      {paymentError && (
        <div className="mt-4 rounded-lg bg-[#FEE2E2] border border-[#DC2626]/20 p-3">
          <p className="text-sm text-[#DC2626]">{paymentError}</p>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-[#E2E8F0] p-6 bg-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#0F172A]">Coins Remaining</span>
          <span className="text-sm text-[#64748B]">{coinBalance.coins_balance} / {coinBalance.coins_lifetime} lifetime</span>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#64748B]">{coinBalance.coins_reserved} reserved in active searches</span>
        </div>
      </div>

      {/* Plan Upgrade Section */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Upgrade Your Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paidTiers.map((t) => (
            <div key={t.id} className={`rounded-2xl border-2 p-5 relative ${
              t.popular ? 'border-[#2563EB] bg-[#DBEAFE]/10' : 'border-[#E2E8F0] bg-white'
            }`}>
              {t.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-3 py-0.5 text-xs font-semibold text-white">
                  Popular
                </span>
              )}
              <h3 className="font-semibold text-[#0F172A]">{t.name}</h3>
              <p className="text-2xl font-bold text-[#0F172A] mt-2">
                {isNigeria ? `₦${t.priceNGN.toLocaleString()}` : `$${t.priceUSD}`}
                <span className="text-sm font-normal text-[#64748B]">/mo</span>
              </p>
              <p className="text-sm text-[#2563EB] font-medium mt-1">{t.coins.toLocaleString()} coins</p>
              <Button
                onClick={() => handleUpgradePlan(t.id)}
                className="mt-4 w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold"
                disabled={paystackLoading === t.id || tier === t.id}
              >
                {tier === t.id ? 'Current Plan' : paystackLoading === t.id ? 'Processing...' : `Get ${t.name}`}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Coin Addons */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Buy Extra Coins</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COIN_ADDONS.map((addon) => (
            <div key={addon.id} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center">
              <p className="text-3xl font-bold text-[#0F172A]">{addon.coins.toLocaleString()}</p>
              <p className="text-sm text-[#64748B] mt-1">coins</p>
              <p className="text-xl font-semibold text-[#0F172A] mt-3">
                {formatAddonPrice(addon, userCountry)}
              </p>
              <Button
                onClick={() => handleBuyCoins(addon)}
                className="mt-4 w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold"
                disabled={paystackLoading === addon.id}
              >
                {paystackLoading === addon.id ? 'Processing...' : 'Buy with Paystack'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Receipt History</h2>
        <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Coins</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-3 text-sm text-[#0F172A]">Signup</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">Free trial credits</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#16A34A]">+50</td>
                  <td className="px-4 py-3"><span className="inline-block rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-medium px-2.5 py-0.5">Complete</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SUPPORT TERMINAL
// ============================================================
function SupportTerminal() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0F172A]">Support Terminal</h1>
      <p className="text-[#64748B] mt-1">Get help or submit a ticket.</p>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Active Tickets</h2>
        <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Ticket ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-6 text-sm text-[#64748B] text-center" colSpan={3}>No active tickets</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Submit New Ticket</h2>
        {submitted ? (
          <div className="rounded-xl bg-[#DCFCE7] border border-[#16A34A]/20 p-4">
            <p className="text-sm text-[#16A34A] font-medium">Ticket submitted. We will respond within 4 hours.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#E2E8F0] p-6 bg-white space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Subject</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" className="border-[#E2E8F0]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Message</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what happened..." className="border-[#E2E8F0] min-h-[100px]" />
            </div>
            <Button onClick={handleSubmit} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold">
              Submit Ticket
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Badge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    free: 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
    starter: 'bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]/20',
    growth: 'bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]/20',
    pro: 'bg-[#0B1120] text-white border-[#0B1120]',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[tier] || styles.free}`}>
      {tier}
    </span>
  )
}

function AbsentBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-2 py-0.5">
      ABSENT
    </span>
  )
}

function CatchAllBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#FEF08A] text-[#D97706] text-xs font-semibold px-2 py-0.5">
      CATCH-ALL
    </span>
  )
}

function DataField({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  const isAbsent = !value || value === 'ABSENT'
  return (
    <div>
      <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">{label}</p>
      {isAbsent ? (
        <div className="mt-1"><AbsentBadge /></div>
      ) : isLink ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-[#2563EB] hover:underline block">
          {value}
        </a>
      ) : (
        <p className="mt-1 text-sm text-[#0F172A]">{value}</p>
      )}
    </div>
  )
}
