'use client'

/**
 * BAD DECISION — World-Class Dashboard
 * Premium sidebar layout. Real backend integration.
 * Handles missing Clerk gracefully — shows sign-in prompt.
 * Views: Search → Searching → Results + Inspector.
 * Payment: Paystack inline. Self-contained component.
 */
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Target, MapPin, Globe, MessageSquare,
  Search, Coins, ArrowRight, CheckCircle2, Clock,
  Download, Settings, LogOut, Menu, X, ChevronDown,
  Loader2, TrendingUp, ExternalLink, Shield, CreditCard, Plus, User, Moon, Sun,
} from 'lucide-react'
import { useAppStore, type EngineType, type Lead, type SmartCollection } from '@/stores/app-store'
import { createTask, getUserTasks, getCollectionLeads, pollTaskUntilDone } from '@/lib/backend'
import { exportLeadsToCsv, downloadCsv } from '@/lib/csv-shield'
import { locationData, getCountriesForContinent, getStatesForCountry } from '@/lib/locations'
import { isClerkConfigured } from '@/lib/clerk-config'

// Dynamically import Clerk hooks only if configured
let useAuth: any = () => ({ isSignedIn: false, userId: null })
let useUser: any = () => ({ user: null, isLoaded: false })
let useClerk: any = () => ({ signOut: () => {} })

if (typeof window !== 'undefined') {
  try {
    const clerk = require('@clerk/nextjs')
    if (isClerkConfigured()) {
      useAuth = clerk.useAuth
      useUser = clerk.useUser
      useClerk = clerk.useClerk
    }
  } catch {}
}

// ============================================================
// COUNTRY FLAGS
// ============================================================
const countryFlags: Record<string, string> = {
  nigeria: '🇳🇬', south_africa: '🇿🇦', kenya: '🇰🇪', egypt: '🇪🇬', ghana: '🇬🇭',
  ethiopia: '🇪🇹', tanzania: '🇹🇿', morocco: '🇲🇦', rwanda: '🇷🇼', uganda: '🇺🇬', cameroon: '🇨🇲',
  usa: '🇺🇸', canada: '🇨🇦', mexico: '🇲🇽',
  brazil: '🇧🇷', argentina: '🇦🇷', colombia: '🇨🇴', chile: '🇨🇱', peru: '🇵🇪',
  uk: '🇬🇧', germany: '🇩🇪', france: '🇫🇷', spain: '🇪🇸', italy: '🇮🇹',
  netherlands: '🇳🇱', sweden: '🇸🇪', switzerland: '🇨🇭', ireland: '🇮🇪', portugal: '🇵🇹', poland: '🇵🇱',
  india: '🇮🇳', china: '🇨🇳', japan: '🇯🇵', uae: '🇦🇪', singapore: '🇸🇬',
  south_korea: '🇰🇷', saudi_arabia: '🇸🇦', israel: '🇮🇱', thailand: '🇹🇭',
  indonesia: '🇮🇩', philippines: '🇵🇭', malaysia: '🇲🇾', turkey: '🇹🇷',
  australia: '🇦🇺', new_zealand: '🇳🇿',
}

// ============================================================
// ENGINE CONFIG
// ============================================================
interface EngineConfig {
  id: EngineType
  name: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  coinCost: number
}

const ENGINE_CARDS: EngineConfig[] = [
  {
    id: 'ads_intent',
    name: 'Ads Intent',
    description: 'Find businesses running ads',
    icon: <Target className="w-5 h-5" />,
    color: 'var(--color-orange)',
    bgColor: 'var(--color-orange-bg)',
    coinCost: 10,
  },
  {
    id: 'smb_maps',
    name: 'SMB Maps',
    description: 'Find local businesses',
    icon: <MapPin className="w-5 h-5" />,
    color: 'var(--color-blue)',
    bgColor: 'var(--color-blue-bg)',
    coinCost: 8,
  },
  {
    id: 'web_absent',
    name: 'Web Absent',
    description: 'Find businesses with no website',
    icon: <Globe className="w-5 h-5" />,
    color: 'var(--color-red)',
    bgColor: 'var(--color-red-bg)',
    coinCost: 12,
  },
  {
    id: 'social_intent',
    name: 'Social Intent',
    description: 'Find people asking for help',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'var(--color-green)',
    bgColor: 'var(--color-green-bg)',
    coinCost: 15,
  },
]

const COIN_PACKAGES = [
  { coins: 500, price: 2500, label: '500 coins' },
  { coins: 1500, price: 6500, label: '1,500 coins' },
  { coins: 3000, price: 12000, label: '3,000 coins' },
  { coins: 5000, price: 18000, label: '5,000 coins' },
]

// ============================================================
// PAYSTACK LOADER
// ============================================================
function loadPaystackScript(onLoad?: () => void) {
  if (typeof window === 'undefined') return
  if ((window as any).PaystackPop) { onLoad?.(); return }
  const script = document.createElement('script')
  script.src = 'https://js.paystack.co/v2/inline.js'
  script.async = true
  script.onload = () => onLoad?.()
  document.head.appendChild(script)
}

// ============================================================
// DASHBOARD VIEW TYPE
// ============================================================
type DashboardView = 'search' | 'searching' | 'results'

// ============================================================
// MAIN DASHBOARD COMPONENT
// ============================================================
export default function DashboardClient() {
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()

  const {
    coinBalance, setCoinBalance,
    selectedEngine, setSelectedEngine,
    searchQuery, setSearchQuery,
    leads, setLeads,
    collections, setCollections,
    selectedLead, setSelectedLead,
    inspectorOpen, setInspectorOpen,
    deductCoins, addCoins,
  } = useAppStore()

  // Local UI state
  const [view, setView] = useState<DashboardView>('search')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [taskStatus, setTaskStatus] = useState<string>('idle')
  const [location, setLocation] = useState({ continent: '', country: '', stateRegion: '' })

  // ============================================================
  // COIN BALANCE REFRESH (only if signed in)
  // ============================================================
  useEffect(() => {
    if (!userId) return
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) return

    let supabase: any
    try {
      const mod = require('@/lib/supabase-client')
      supabase = mod.supabase
    } catch { return }

    const refresh = async () => {
      try {
        const { data } = await supabase
          .from('usage_ledger')
          .select('coins_balance, coins_reserved, coins_lifetime')
          .eq('user_id', userId)
          .single()
        if (data) {
          setCoinBalance({
            coins_balance: data.coins_balance,
            coins_reserved: data.coins_reserved,
            coins_lifetime: data.coins_lifetime,
          })
        }
      } catch { /* silent */ }
    }
    refresh()
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [userId, setCoinBalance])

  // ============================================================
  // LOAD RECENT TASKS (only if signed in)
  // ============================================================
  useEffect(() => {
    if (!userId) return
    const loadTasks = async () => {
      try {
        const data = await getUserTasks(userId)
        if (data.tasks) {
          const mapped: SmartCollection[] = data.tasks.map((t: any) => ({
            id: t.id,
            name: t.query || 'Untitled Search',
            task_type: t.task_type as EngineType,
            lead_count: t.lead_count || 0,
            created_at: t.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          }))
          setCollections(mapped)
        }
      } catch { /* silent */ }
    }
    loadTasks()
  }, [userId, setCollections])

  // ============================================================
  // SEARCH HANDLER
  // ============================================================
  const handleSearch = useCallback(async () => {
    if (!selectedEngine || !searchQuery.trim() || !userId) return

    const engineConfig = ENGINE_CARDS.find(e => e.id === selectedEngine)
    if (!engineConfig) return

    if (coinBalance.coins_balance < engineConfig.coinCost) {
      setPaymentModalOpen(true)
      return
    }

    setView('searching')
    setTaskStatus('processing')

    try {
      const taskData = await createTask({
        user_id: userId,
        task_type: selectedEngine,
        query: searchQuery.trim(),
        coins_reserved: engineConfig.coinCost,
      })

      const taskId = taskData.task_id || taskData.id
      deductCoins(engineConfig.coinCost)

      const completedTask = await pollTaskUntilDone(userId, taskId, 90, (status: string) => {
        setTaskStatus(status)
      })

      if (completedTask && (completedTask.status === 'completed' || completedTask.status === 'exhausted')) {
        const leadsData = await getCollectionLeads(taskId)
        setLeads(leadsData.leads || [])
      } else {
        setLeads([])
      }

      setTaskStatus('completed')
      setView('results')

      // Refresh collections
      try {
        const tasksData = await getUserTasks(userId)
        if (tasksData.tasks) {
          const updated = tasksData.tasks.map((t: any) => ({
            id: t.id,
            name: t.query || 'Untitled Search',
            task_type: t.task_type as EngineType,
            lead_count: t.lead_count || 0,
            created_at: t.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          }))
          setCollections(updated)
        }
      } catch { /* non-critical */ }
    } catch (err) {
      console.error('[DASHBOARD] Search failed:', err)
      setTaskStatus('failed')
      setLeads([])
      setView('results')
    }
  }, [selectedEngine, searchQuery, userId, coinBalance, deductCoins, setLeads, setCollections])

  // ============================================================
  // LOAD COLLECTION LEADS
  // ============================================================
  const handleSelectCollection = useCallback(async (col: SmartCollection) => {
    if (!userId) return
    try {
      const data = await getCollectionLeads(col.id)
      if (data.leads && data.leads.length > 0) {
        setLeads(data.leads)
        setSelectedEngine(col.task_type)
        setView('results')
        setSidebarOpen(false)
      }
    } catch (err) {
      console.error('[DASHBOARD] Failed to load collection:', err)
    }
  }, [userId, setLeads, setSelectedEngine])

  // ============================================================
  // EXPORT HANDLER
  // ============================================================
  const handleExport = useCallback(() => {
    if (leads.length === 0) return
    const csv = exportLeadsToCsv(leads, selectedEngine || undefined)
    downloadCsv(csv, `bad-decision-leads-${Date.now()}.csv`)
  }, [leads, selectedEngine])

  // ============================================================
  // PAYSTACK PAYMENT
  // ============================================================
  const handleBuyCoins = useCallback((pkg: typeof COIN_PACKAGES[0]) => {
    loadPaystackScript(() => {
      const email = user?.emailAddresses?.[0]?.emailAddress
      if (!email || !userId) return

      const ref = `bd_${userId}_${Date.now()}`
      ;(window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_xxx',
        email,
        amount: pkg.price,
        currency: 'NGN',
        reference: ref,
        onClose: () => {},
        callback: async () => {
          addCoins(pkg.coins)
          setPaymentModalOpen(false)
          // Refresh balance from Supabase
          if (userId) {
            try {
              const mod = require('@/lib/supabase-client')
              const supabase = mod.supabase
              const { data } = await supabase
                .from('usage_ledger')
                .select('coins_balance, coins_reserved, coins_lifetime')
                .eq('user_id', userId)
                .single()
              if (data) {
                setCoinBalance({
                  coins_balance: data.coins_balance,
                  coins_reserved: data.coins_reserved,
                  coins_lifetime: data.coins_lifetime,
                })
              }
            } catch { /* silent */ }
          }
        },
      }).openIframe()
    })
  }, [user, userId, addCoins, setCoinBalance])

  // ============================================================
  // NEW SEARCH — Reset state
  // ============================================================
  const handleNewSearch = useCallback(() => {
    setSelectedEngine(null)
    setSearchQuery('')
    setLeads([])
    setLocation({ continent: '', country: '', stateRegion: '' })
    setView('search')
  }, [setSelectedEngine, setSearchQuery, setLeads])

  // ============================================================
  // CURRENT ENGINE CONFIG
  // ============================================================
  const currentEngine = useMemo(
    () => ENGINE_CARDS.find(e => e.id === selectedEngine),
    [selectedEngine]
  )

  // ============================================================
  // UNAUTHENTICATED GUARD — Show sign-in prompt
  // ============================================================
  if (!isSignedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-purple)] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--color-accent)]/20">
            <span className="text-white font-bold text-lg">BD</span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Sign in to continue</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            You need an account to access the dashboard and find verified leads.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Sign In
            </a>
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-surface)] transition-colors"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER — Authenticated Dashboard
  // ============================================================
  return (
    <div className="h-screen flex bg-[var(--bg-primary)] relative overflow-hidden">
      {/* ============ MOBILE SIDEBAR OVERLAY ============ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ============ LEFT SIDEBAR ============ */}
      <aside className={`
        w-[280px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col flex-shrink-0
        fixed md:relative inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--border-color)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-purple)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-semibold text-[var(--text-primary)] text-sm tracking-tight">Bad Decision</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-8 h-8 rounded-lg hover:bg-[var(--bg-primary)] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Coin Balance */}
        <div className="px-5 py-4 flex-shrink-0">
          <div className="rounded-xl bg-gradient-to-br from-[var(--bg-inverse)] to-[var(--bg-inverse)]/90 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[var(--color-accent)]/10 -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Coins className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-[var(--text-inverse)]/60 font-medium uppercase tracking-wider">Coins</span>
            </div>
            <p className="text-2xl font-bold text-white">{coinBalance.coins_balance.toLocaleString()}</p>
            {coinBalance.coins_reserved > 0 && (
              <p className="text-xs text-[var(--text-inverse)]/40 mt-0.5">{coinBalance.coins_reserved} reserved</p>
            )}
          </div>
        </div>

        {/* New Search CTA */}
        <div className="px-5 pb-3 flex-shrink-0">
          <motion.button
            onClick={handleNewSearch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white text-sm font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-shadow"
          >
            <Plus className="w-4 h-4" />
            New Search
          </motion.button>
        </div>

        {/* Recent Searches */}
        <div className="flex-1 overflow-y-auto px-5 min-h-0">
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Recent Searches</p>
          <div className="space-y-0.5">
            {collections.length === 0 && (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">No searches yet</p>
            )}
            {collections.slice(0, 20).map((col) => {
              const engine = ENGINE_CARDS.find(e => e.id === col.task_type)
              return (
                <button
                  key={col.id}
                  onClick={() => handleSelectCollection(col)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--bg-primary)] text-sm transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span style={{ color: engine?.color || 'var(--text-tertiary)' }} className="flex-shrink-0">
                      {engine?.icon || <Search className="w-4 h-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-primary)] text-sm truncate group-hover:text-[var(--color-accent)] transition-colors">{col.name}</p>
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0">{col.lead_count}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-[var(--border-color)] p-4 space-y-0.5 flex-shrink-0">
          <button
            onClick={() => setPaymentModalOpen(true)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors flex items-center gap-2.5"
          >
            <Coins className="w-4 h-4 text-[var(--color-coin)]" />
            Get More Coins
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors flex items-center gap-2.5"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => { signOut(); setSettingsOpen(false) }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2.5"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-4 md:px-6 flex-shrink-0 bg-[var(--bg-primary)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-colors"
            >
              <Menu className="w-5 h-5 text-[var(--text-primary)]" />
            </button>
            {view === 'results' && currentEngine && (
              <button
                onClick={handleNewSearch}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowRight className="w-3 h-3 rotate-180" />
                Back to Search
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {view === 'results' && leads.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </motion.button>
            )}
            {/* Inline coin balance */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Coins className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-[var(--color-coin)]">{coinBalance.coins_balance}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {view === 'search' && (
              <SearchView
                key="search"
                selectedEngine={selectedEngine}
                onSelectEngine={setSelectedEngine}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                location={location}
                onLocationChange={setLocation}
                onSearch={handleSearch}
                coinBalance={coinBalance.coins_balance}
              />
            )}
            {view === 'searching' && (
              <SearchingView
                key="searching"
                engine={currentEngine}
                query={searchQuery}
                taskStatus={taskStatus}
              />
            )}
            {view === 'results' && (
              <ResultsView
                key="results"
                leads={leads}
                engineType={selectedEngine}
                onSelectLead={(lead) => { setSelectedLead(lead); setInspectorOpen(true) }}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ============ INSPECTOR PANEL ============ */}
      <AnimatePresence>
        {inspectorOpen && selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setInspectorOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[var(--bg-secondary)] border-l border-[var(--border-color)] flex flex-col overflow-y-auto z-50"
            >
              <InspectorContent
                lead={selectedLead}
                onClose={() => setInspectorOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ============ SETTINGS MODAL ============ */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[440px] bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-2xl z-50 overflow-hidden"
            >
              <SettingsModalContent
                user={user}
                onClose={() => setSettingsOpen(false)}
                onSignOut={() => { signOut(); setSettingsOpen(false) }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============ PAYMENT MODAL ============ */}
      <AnimatePresence>
        {paymentModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setPaymentModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[440px] bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-2xl z-50 overflow-hidden"
            >
              <PaymentModal
                onClose={() => setPaymentModalOpen(false)}
                onBuy={handleBuyCoins}
                currentBalance={coinBalance.coins_balance}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// SEARCH VIEW
// ============================================================
function SearchView({
  selectedEngine,
  onSelectEngine,
  searchQuery,
  onSearchQueryChange,
  location,
  onLocationChange,
  onSearch,
  coinBalance,
}: {
  selectedEngine: EngineType | null
  onSelectEngine: (e: EngineType | null) => void
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  location: { continent: string; country: string; stateRegion: string }
  onLocationChange: (loc: { continent: string; country: string; stateRegion: string }) => void
  onSearch: () => void
  coinBalance: number
}) {
  const currentEngine = ENGINE_CARDS.find(e => e.id === selectedEngine)
  const canSearch = selectedEngine && searchQuery.trim()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col"
    >
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Engine Selector */}
          <div className="mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-1">Find Leads</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Choose a search engine to get started</p>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {ENGINE_CARDS.map((engine) => {
                const isSelected = selectedEngine === engine.id
                return (
                  <motion.button
                    key={engine.id}
                    onClick={() => onSelectEngine(engine.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 group
                      ${isSelected
                        ? 'border-current bg-[var(--bg-secondary)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--border-light)]'
                      }
                    `}
                    style={isSelected ? { borderColor: engine.color } : undefined}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors"
                      style={{
                        color: isSelected ? engine.color : 'var(--text-tertiary)',
                        background: isSelected ? engine.bgColor : 'var(--bg-surface)',
                      }}
                    >
                      {engine.icon}
                    </div>
                    <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-0.5">{engine.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mb-2">{engine.description}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ color: engine.color, background: engine.bgColor }}
                    >
                      <Coins className="w-3 h-3" />
                      {engine.coinCost} coins
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Search Form (visible when engine is selected) */}
          <AnimatePresence mode="wait">
            {selectedEngine && currentEngine && (
              <motion.div
                key={selectedEngine}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                {/* Search Input */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    Search Query
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: currentEngine.color }}>
                      {currentEngine.icon}
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => onSearchQueryChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canSearch && onSearch()}
                      placeholder="e.g. restaurants, dentists, plumbers"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Location Selector */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    Location
                  </label>
                  <LocationDropdowns
                    location={location}
                    onLocationChange={onLocationChange}
                  />
                </div>

                {/* Coin Cost Indicator */}
                <div className="mb-6 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Coins className="w-3.5 h-3.5 text-[var(--color-coin)]" />
                  <span>This search costs <strong className="text-[var(--text-primary)]">{currentEngine.coinCost} coins</strong>. You have <strong className="text-[var(--text-primary)]">{coinBalance} coins</strong>.</span>
                  {coinBalance < currentEngine.coinCost && (
                    <span className="text-[var(--color-red)] font-medium ml-1">Insufficient coins.</span>
                  )}
                </div>

                {/* Search Button */}
                <motion.button
                  onClick={onSearch}
                  disabled={!canSearch}
                  whileHover={canSearch ? { scale: 1.01 } : {}}
                  whileTap={canSearch ? { scale: 0.99 } : {}}
                  className={`
                    w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                    ${canSearch
                      ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30'
                      : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] cursor-not-allowed'
                    }
                  `}
                >
                  <Search className="w-4 h-4" />
                  Search with {currentEngine.name}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// LOCATION DROPDOWNS (3 side-by-side)
// ============================================================
function LocationDropdowns({
  location,
  onLocationChange,
}: {
  location: { continent: string; country: string; stateRegion: string }
  onLocationChange: (loc: { continent: string; country: string; stateRegion: string }) => void
}) {
  const countries = useMemo(() => getCountriesForContinent(location.continent), [location.continent])
  const states = useMemo(() => getStatesForCountry(location.continent, location.country), [location.continent, location.country])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {/* Region */}
      <Dropdown
        placeholder="Region"
        value={location.continent}
        options={locationData.map(c => ({ value: c.value, label: `${c.emoji} ${c.label}` }))}
        onChange={(v) => onLocationChange({ continent: v, country: '', stateRegion: '' })}
      />
      {/* Country */}
      <Dropdown
        placeholder="Country"
        value={location.country}
        options={countries.map(c => ({
          value: c.value,
          label: `${countryFlags[c.value] || ''} ${c.label}`.trim(),
        }))}
        onChange={(v) => onLocationChange({ ...location, country: v, stateRegion: '' })}
        disabled={!location.continent}
      />
      {/* State/Region */}
      <Dropdown
        placeholder="State / Region"
        value={location.stateRegion}
        options={states}
        onChange={(v) => onLocationChange({ ...location, stateRegion: v })}
        disabled={!location.country || states.length === 0}
      />
    </div>
  )
}

// ============================================================
// GENERIC DROPDOWN
// ============================================================
function Dropdown({
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
}: {
  placeholder: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)
  const filtered = useMemo(() => {
    if (!search) return options
    return options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  }, [options, search])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setOpen(!open); setSearch('') } }}
        className={`
          w-full flex items-center justify-between gap-2 h-10 px-3 rounded-lg border text-sm text-left transition-all
          ${disabled ? 'opacity-40 cursor-not-allowed bg-[var(--bg-surface)] border-[var(--border-color)]' : 'cursor-pointer'}
          ${open ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/10 bg-[var(--bg-primary)]' : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--border-light)]'}
          ${selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}
        `}
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-lg overflow-hidden"
            style={{ boxShadow: 'var(--shadow-dropdown)' }}
          >
            {options.length > 8 && (
              <div className="p-2 border-b border-[var(--border-color)]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
                  autoFocus
                />
              </div>
            )}
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-xs text-[var(--text-tertiary)] text-center">No results</p>
              ) : (
                filtered.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); setSearch('') }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2
                      ${opt.value === value
                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                      }`}
                  >
                    {opt.value === value && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// SEARCHING VIEW
// ============================================================
function SearchingView({
  engine,
  query,
  taskStatus,
}: {
  engine: EngineConfig | undefined
  query: string
  taskStatus: string
}) {
  const statusMessages: Record<string, string> = {
    idle: 'Preparing search...',
    pending: 'Queuing your search...',
    processing: 'Scanning the internet for leads...',
    completed: 'Search complete!',
    failed: 'Search failed. Please try again.',
    exhausted: 'Search complete!',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: engine?.bgColor, color: engine?.color }}
        >
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          {statusMessages[taskStatus] || 'Processing...'}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Searching for &quot;{query}&quot; with {engine?.name || 'engine'}
        </p>
        <div className="w-48 h-1.5 bg-[var(--bg-surface)] rounded-full mx-auto overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, var(--color-accent), var(--color-accent-purple))` }}
            initial={{ width: '0%' }}
            animate={{ width: taskStatus === 'completed' || taskStatus === 'exhausted' ? '100%' : '70%' }}
            transition={{ duration: 3, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// RESULTS VIEW
// ============================================================
function ResultsView({
  leads,
  engineType,
  onSelectLead,
}: {
  leads: Lead[]
  engineType: EngineType | null
  onSelectLead: (lead: Lead) => void
}) {
  if (leads.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex items-center justify-center"
      >
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No leads found</h3>
          <p className="text-sm text-[var(--text-secondary)]">Try a different search query or location.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      {/* Results Header */}
      <div className="px-4 md:px-6 py-3 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-primary)]">
        <p className="text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">{leads.length}</strong> leads found
        </p>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)] sticky top-0">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider hidden md:table-cell">Decision Maker</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider hidden lg:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider hidden xl:table-cell">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {leads.map((lead, i) => (
              <tr
                key={lead.domain_hash || i}
                onClick={() => onSelectLead(lead)}
                className="hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">
                    {lead.company_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] truncate max-w-[200px]">
                    {lead.website_url || 'No website'}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="text-[var(--text-primary)]">{lead.dm_name || '—'}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">{lead.dm_position || ''}</div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-[var(--text-secondary)] text-xs truncate max-w-[180px] block">
                    {lead.verified_email || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <span className="text-[var(--text-secondary)] text-xs">{lead.phone || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  {lead.verified_email ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#DCFCE7] text-[#16A34A] dark:bg-green-950/30 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-surface)] text-[var(--text-tertiary)]">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// ============================================================
// INSPECTOR PANEL CONTENT
// ============================================================
function InspectorContent({
  lead,
  onClose,
}: {
  lead: Lead
  onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-[var(--text-primary)] truncate">{lead.company_name}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-primary)] flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Company Info */}
        <div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Company</p>
          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1">{lead.company_name}</h4>
          {lead.website_url && (
            <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-accent)] hover:underline flex items-center gap-1">
              {lead.website_url} <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {lead.address && <p className="text-sm text-[var(--text-secondary)] mt-1">{lead.address}</p>}
        </div>

        {/* Decision Maker */}
        <div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Decision Maker</p>
          <p className="text-[var(--text-primary)] font-medium">{lead.dm_name || 'Not found'}</p>
          {lead.dm_position && <p className="text-sm text-[var(--text-secondary)]">{lead.dm_position}</p>}
        </div>

        {/* Contact Details */}
        <div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Contact</p>
          <div className="space-y-2">
            {lead.verified_email && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span className="text-sm text-[var(--text-primary)]">{lead.verified_email}</span>
                {lead.is_catchall && <span className="text-[10px] text-amber-500 font-medium ml-1">(catchall)</span>}
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">{lead.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        {(lead.linkedin || lead.instagram) && (
          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Social</p>
            <div className="space-y-2">
              {lead.linkedin && (
                <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-accent)] hover:underline flex items-center gap-1">
                  LinkedIn <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {lead.instagram && (
                <a href={lead.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-accent)] hover:underline flex items-center gap-1">
                  Instagram <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// SETTINGS MODAL
// ============================================================
function SettingsModalContent({
  user,
  onClose,
  onSignOut,
}: {
  user: any
  onClose: () => void
  onSignOut: () => void
}) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Settings</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-surface)] flex items-center justify-center">
          <X className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Account */}
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-purple)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)] text-sm">
                {user?.fullName || user?.firstName || 'User'}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {user?.emailAddresses?.[0]?.emailAddress || 'No email'}
              </p>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

// ============================================================
// PAYMENT MODAL
// ============================================================
function PaymentModal({
  onClose,
  onBuy,
  currentBalance,
}: {
  onClose: () => void
  onBuy: (pkg: typeof COIN_PACKAGES[0]) => void
  currentBalance: number
}) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Get More Coins</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Current balance: {currentBalance} coins</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-surface)] flex items-center justify-center">
          <X className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="space-y-3">
        {COIN_PACKAGES.map((pkg) => (
          <button
            key={pkg.coins}
            onClick={() => onBuy(pkg)}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-[var(--text-primary)] text-sm">{pkg.label}</span>
            </div>
            <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
              {pkg.currency === 'USD' ? '$' : '\u20A6'}{pkg.price.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-4">
        Secure payment via Paystack. Coins added instantly.
      </p>
    </div>
  )
}
