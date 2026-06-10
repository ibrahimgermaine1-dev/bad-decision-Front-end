'use client'

/**
 * BAD DECISION — World-Class Dashboard
 * Premium sidebar layout. Real backend integration.
 * Handles missing Clerk gracefully — shows sign-in prompt.
 * Views: Search → Searching → Results + Inspector.
 * Payment: Paystack inline. Self-contained component.
 *
 * Uses a two-component pattern for Clerk hooks:
 * - DashboardClient (this file): checks isClerkConfigured(), renders either
 *   the signed-out prompt or DashboardWithClerk
 * - DashboardWithClerk (in dashboard-clerk-wrapper.tsx): actually calls
 *   useAuth/useUser/useClerk hooks — only mounted inside ClerkProvider
 */
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Target, MapPin, Globe, MessageSquare,
  Search, Coins, ArrowRight, CheckCircle2, Clock,
  Download, Settings, LogOut, Menu, X, ChevronDown,
  Loader2, TrendingUp, ExternalLink, Shield, CreditCard, Plus, User, Moon, Sun, Zap, Crown, Sparkles,
} from 'lucide-react'
import { useAppStore, type EngineType, type Lead, type SmartCollection } from '@/stores/app-store'
import { createTask, getUserTasks, getCollectionLeads, getLeadsByTaskId, pollTaskUntilDone, fetchPaystackPublicKey, TaskCreateError, getUserProfile, initializePaystackPayment } from '@/lib/backend'
import { exportLeadsToCsv, downloadCsv } from '@/lib/csv-shield'
import { locationData, getCountriesForContinent, getStatesForCountry } from '@/lib/locations'
import { isClerkConfigured } from '@/lib/clerk-config'
import { DashboardWithClerk } from './dashboard-clerk-wrapper'

// ============================================================
// COUNTRY FLAGS
// ============================================================
const countryFlags: Record<string, string> = {
  // Africa
  nigeria: '🇳🇬', south_africa: '🇿🇦', kenya: '🇰🇪', egypt: '🇪🇬', ghana: '🇬🇭',
  ethiopia: '🇪🇹', tanzania: '🇹🇿', morocco: '🇲🇦', rwanda: '🇷🇼', uganda: '🇺🇬', cameroon: '🇨🇲',
  algeria: '🇩🇿', angola: '🇦🇴', benin: '🇧🇯', botswana: '🇧🇼', burkina_faso: '🇧🇫', burundi: '🇧🇮',
  cabo_verde: '🇨🇻', central_african_republic: '🇨🇫', chad: '🇹🇩', comoros: '🇰🇲', congo_brazzaville: '🇨🇬',
  congo_drc: '🇨🇩', djibouti: '🇩🇯', equatorial_guinea: '🇬🇶', eritrea: '🇪🇷', eswatini: '🇸🇿',
  gabon: '🇬🇦', gambia: '🇬🇲', guinea: '🇬🇳', guinea_bissau: '🇬🇼', ivory_coast: '🇨🇮',
  lesotho: '🇱🇸', liberia: '🇱🇷', libya: '🇱🇾', madagascar: '🇲🇬', malawi: '🇲🇼', mali: '🇲🇱',
  mauritania: '🇲🇷', mauritius: '🇲🇺', mozambique: '🇲🇿', namibia: '🇳🇦', niger: '🇳🇪',
  sao_tome_and_principe: '🇸🇹', senegal: '🇸🇳', seychelles: '🇸🇨', sierra_leone: '🇸🇱', somalia: '🇸🇴',
  south_sudan: '🇸🇸', sudan: '🇸🇩', togo: '🇹🇬', tunisia: '🇹🇳', zambia: '🇿🇲', zimbabwe: '🇿🇼',
  // North America
  usa: '🇺🇸', canada: '🇨🇦', mexico: '🇲🇽',
  antigua_and_barbuda: '🇦🇬', bahamas: '🇧🇸', barbados: '🇧🇧', belize: '🇧🇿', costa_rica: '🇨🇷',
  cuba: '🇨🇺', dominica: '🇩🇲', dominican_republic: '🇩🇴', el_salvador: '🇸🇻', grenada: '🇬🇩',
  guatemala: '🇬🇹', haiti: '🇭🇹', honduras: '🇭🇳', jamaica: '🇯🇲', nicaragua: '🇳🇮', panama: '🇵🇦',
  saint_kitts_and_nevis: '🇰🇳', saint_lucia: '🇱🇨', saint_vincent_and_the_grenadines: '🇻🇨',
  trinidad_and_tobago: '🇹🇹',
  // South America
  brazil: '🇧🇷', argentina: '🇦🇷', colombia: '🇨🇴', chile: '🇨🇱', peru: '🇵🇪',
  bolivia: '🇧🇴', ecuador: '🇪🇨', guyana: '🇬🇾', paraguay: '🇵🇾', suriname: '🇸🇷',
  uruguay: '🇺🇾', venezuela: '🇻🇪',
  // Europe
  uk: '🇬🇧', germany: '🇩🇪', france: '🇫🇷', spain: '🇪🇸', italy: '🇮🇹',
  netherlands: '🇳🇱', sweden: '🇸🇪', switzerland: '🇨🇭', ireland: '🇮🇪', portugal: '🇵🇹', poland: '🇵🇱',
  austria: '🇦🇹', belgium: '🇧🇪', bulgaria: '🇧🇬', croatia: '🇭🇷', czech_republic: '🇨🇿',
  denmark: '🇩🇰', estonia: '🇪🇪', finland: '🇫🇮', greece: '🇬🇷', hungary: '🇭🇺', iceland: '🇮🇸',
  latvia: '🇱🇻', liechtenstein: '🇱🇮', lithuania: '🇱🇹', luxembourg: '🇱🇺', malta: '🇲🇹', monaco: '🇲🇨',
  montenegro: '🇲🇪', north_macedonia: '🇲🇰', norway: '🇳🇴', romania: '🇷🇴', san_marino: '🇸🇲',
  serbia: '🇷🇸', slovakia: '🇸🇰', slovenia: '🇸🇮', ukraine: '🇺🇦',
  // Asia
  india: '🇮🇳', china: '🇨🇳', japan: '🇯🇵', uae: '🇦🇪', singapore: '🇸🇬',
  south_korea: '🇰🇷', saudi_arabia: '🇸🇦', israel: '🇮🇱', thailand: '🇹🇭',
  indonesia: '🇮🇩', philippines: '🇵🇭', malaysia: '🇲🇾', turkey: '🇹🇷',
  afghanistan: '🇦🇫', armenia: '🇦🇲', azerbaijan: '🇦🇿', bahrain: '🇧🇭', bangladesh: '🇧🇩',
  bhutan: '🇧🇹', brunei: '🇧🇳', cambodia: '🇰🇭', georgia: '🇬🇪', iraq: '🇮🇶', jordan: '🇯🇴',
  kazakhstan: '🇰🇿', kuwait: '🇰🇼', kyrgyzstan: '🇰🇬', laos: '🇱🇦', lebanon: '🇱🇧', maldives: '🇲🇻',
  mongolia: '🇲🇳', myanmar: '🇲🇲', nepal: '🇳🇵', oman: '🇴🇲', pakistan: '🇵🇰', palestine: '🇵🇸',
  qatar: '🇶🇦', sri_lanka: '🇱🇰', syria: '🇸🇾', tajikistan: '🇹🇯', timor_leste: '🇹🇱',
  turkmenistan: '🇹🇲', uzbekistan: '🇺🇿', vietnam: '🇻🇳', yemen: '🇾🇪',
  // Oceania
  australia: '🇦🇺', new_zealand: '🇳🇿',
  fiji: '🇫🇯', kiribati: '🇰🇮', marshall_islands: '🇲🇭', micronesia: '🇫🇲', nauru: '🇳🇷',
  palau: '🇵🇼', papua_new_guinea: '🇵🇬', samoa: '🇼🇸', solomon_islands: '🇸🇧', tonga: '🇹🇴',
  tuvalu: '🇹🇻', vanuatu: '🇻🇺',
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
    name: 'Ad Finder',
    description: 'Find businesses running ads',
    icon: <Target className="w-5 h-5" />,
    color: 'var(--color-orange)',
    bgColor: 'var(--color-orange-bg)',
    coinCost: 10,
  },
  {
    id: 'smb_maps',
    name: 'Local Search',
    description: 'Find local businesses near you',
    icon: <MapPin className="w-5 h-5" />,
    color: 'var(--color-blue)',
    bgColor: 'var(--color-blue-bg)',
    coinCost: 8,
  },
  {
    id: 'web_absent',
    name: 'No Website',
    description: 'Find businesses without a website',
    icon: <Globe className="w-5 h-5" />,
    color: 'var(--color-red)',
    bgColor: 'var(--color-red-bg)',
    coinCost: 12,
  },
  {
    id: 'social_intent',
    name: 'Social Leads',
    description: 'Find people looking for help',
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
// PRICING TIERS
// ============================================================
const PRICING_TIERS = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: 0,
    coins: 50,
    features: ['50 free coins monthly', '2-3 searches per month', 'Basic lead data', 'CSV export'],
    icon: <Zap className="w-5 h-5" />,
    color: 'var(--text-tertiary)',
    planType: 'free',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 4999,
    coins: 500,
    features: ['500 coins monthly', '~25 searches per month', 'Full lead data', 'Priority processing', 'CSV export'],
    icon: <Sparkles className="w-5 h-5" />,
    color: 'var(--color-blue)',
    planType: 'starter',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 14999,
    coins: 2000,
    features: ['2,000 coins monthly', '~100 searches per month', 'Full lead data', 'Priority processing', 'API access', 'CSV export'],
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'var(--color-accent)',
    planType: 'growth',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39999,
    coins: 5000,
    features: ['5,000 coins monthly', 'Unlimited searches', 'Full lead data', 'Priority processing', 'API access', 'Dedicated support', 'CSV export'],
    icon: <Crown className="w-5 h-5" />,
    color: 'var(--color-orange)',
    planType: 'pro',
  },
]

// ============================================================
// ENGINE-SPECIFIC PROGRESS MESSAGES
// ============================================================
const ENGINE_PROGRESS_MESSAGES: Record<EngineType, string[]> = {
  ads_intent: [
    'Scanning ad networks...',
    'Checking campaign data...',
    'Identifying advertisers...',
    'Compiling leads...',
  ],
  smb_maps: [
    'Scanning business directories...',
    'Searching maps data...',
    'Finding local businesses...',
    'Compiling leads...',
  ],
  web_absent: [
    'Scanning business listings...',
    'Checking web presence...',
    'Identifying gaps...',
    'Compiling leads...',
  ],
  social_intent: [
    'Scanning social platforms...',
    'Finding intent signals...',
    'Matching queries...',
    'Compiling leads...',
  ],
}

// ============================================================
// POPULAR REGIONS
// ============================================================
const POPULAR_REGIONS = ['africa', 'north_america', 'europe']

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
// TOAST NOTIFICATION SYSTEM
// ============================================================
interface Toast {
  id: string
  message: string
  action?: { label: string; onClick: () => void }
  type: 'error' | 'warning' | 'info'
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
              ${toast.type === 'error' ? 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800' : ''}
              ${toast.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800' : ''}
            `}
          >
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                toast.type === 'error' ? 'text-red-800 dark:text-red-200' :
                toast.type === 'warning' ? 'text-amber-800 dark:text-amber-200' :
                'text-blue-800 dark:text-blue-200'
              }`}>
                {toast.message}
              </p>
            </div>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  toast.type === 'error' ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900/70' :
                  toast.type === 'warning' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-900/70' :
                  'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900/70'
                }`}
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// MAIN DASHBOARD COMPONENT (exported)
// ============================================================
export default function DashboardClient() {
  // If Clerk is not configured, show the sign-in prompt immediately
  if (!isClerkConfigured()) {
    return <UnauthenticatedGuard />
  }

  // Clerk is configured — render the wrapper that uses Clerk hooks
  return <DashboardWithClerk />
}

// ============================================================
// UNAUTHENTICATED GUARD — Show sign-in prompt
// ============================================================
function UnauthenticatedGuard() {
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
// DASHBOARD CONTENT (shared by both Clerk and non-Clerk paths)
// This is the actual dashboard UI, extracted so the Clerk wrapper
// can pass auth state as props.
// ============================================================
export function DashboardContent({
  isSignedIn,
  userId,
  user,
  signOut,
}: {
  isSignedIn: boolean
  userId: string | null
  user: any
  signOut: () => void
}) {
  if (!isSignedIn) {
    return <UnauthenticatedGuard />
  }

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

  // New state for upgrade modal and error messages
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [userTier, setUserTier] = useState<string>('free')

  // Toast notification state
  const [toasts, setToasts] = useState<Toast[]>([])

  // ============================================================
  // TOAST HELPERS
  // ============================================================
  const addToast = useCallback((message: string, type: Toast['type'] = 'error', action?: Toast['action']) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setToasts(prev => [...prev, { id, message, type, action }])
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 8000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // ============================================================
  // FETCH USER TIER/PROFILE
  // ============================================================
  useEffect(() => {
    if (!userId) return
    getUserProfile(userId).then(data => {
      if (data.profile?.tier) setUserTier(data.profile.tier)
    }).catch(() => {})
  }, [userId])

  // ============================================================
  // COIN BALANCE REFRESH (only if signed in)
  // ============================================================
  useEffect(() => {
    if (!userId) return

    const refresh = async () => {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bad-decision-backend-main.onrender.com'
        const res = await fetch(`${BACKEND_URL}/api/coins/${userId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.balance) {
            setCoinBalance({
              coins_balance: data.balance.coins_balance,
              coins_reserved: data.balance.coins_reserved,
              coins_lifetime: data.balance.coins_lifetime,
            })
          }
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
            lead_count: t.results_count || t.lead_count || 0,
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
    setErrorMessage('')

    try {
      const taskData = await createTask({
        user_id: userId,
        task_type: selectedEngine,
        query: searchQuery.trim(),
        coins_reserved: engineConfig.coinCost,
        continent: location.continent,
        country: location.country,
        state_region: location.stateRegion,
      })

      // Backend returns {success: true, task: [{id: "uuid", ...}]}
      const taskId = taskData.task?.[0]?.id || taskData.task_id || taskData.id

      if (!taskId) {
        console.error('[DASHBOARD] No task ID in response:', taskData)
        throw new Error('Failed to create search task — no task ID returned')
      }

      deductCoins(engineConfig.coinCost)

      const completedTask = await pollTaskUntilDone(userId, taskId, 90, (status: string) => {
        setTaskStatus(status)
      })

      if (completedTask && (completedTask.status === 'completed' || completedTask.status === 'exhausted')) {
        // Try fetching leads by task_id first (more reliable), then by collection_id
        let leadsData: any = { leads: [] }
        try {
          leadsData = await getLeadsByTaskId(taskId)
        } catch {
          try {
            leadsData = await getCollectionLeads(taskId)
          } catch { /* fallback empty */ }
        }
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
            lead_count: t.results_count || t.lead_count || 0,
            created_at: t.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          }))
          setCollections(updated)
        }
      } catch { /* non-critical */ }
    } catch (err) {
      console.error('[DASHBOARD] Search failed:', err)

      // Check for TaskCreateError and handle gracefully
      if (err instanceof TaskCreateError) {
        if (err.code === 'INSUFFICIENT_COINS') {
          // Show payment modal, stay on search view
          setPaymentModalOpen(true)
          setView('search')
          addToast('Not enough coins. Top up to continue searching.', 'error', {
            label: 'Get Coins',
            onClick: () => setPaymentModalOpen(true),
          })
        } else if (err.code === 'ENGINE_NOT_AVAILABLE') {
          // Show upgrade modal
          setUpgradeModalOpen(true)
          setView('search')
          setErrorMessage('This search engine requires an upgraded plan.')
          addToast('Engine not available. Upgrade your plan to access it.', 'warning', {
            label: 'Upgrade',
            onClick: () => setUpgradeModalOpen(true),
          })
        } else if (err.code === 'RATE_LIMITED') {
          // Show rate limit message
          setView('search')
          setErrorMessage('Daily search limit reached. Upgrade for more searches.')
          addToast('Daily search limit reached. Upgrade for more searches.', 'warning', {
            label: 'Upgrade',
            onClick: () => setUpgradeModalOpen(true),
          })
        } else {
          // Unknown TaskCreateError — still go to results with empty leads
          setTaskStatus('failed')
          setLeads([])
          setView('results')
        }
      } else {
        // Non-TaskCreateError — keep existing behavior (go to results with empty leads)
        setTaskStatus('failed')
        setLeads([])
        setView('results')
      }
    }
  }, [selectedEngine, searchQuery, userId, coinBalance, deductCoins, setLeads, setCollections, location, addToast])

  // ============================================================
  // LOAD COLLECTION LEADS
  // ============================================================
  const handleSelectCollection = useCallback(async (col: SmartCollection) => {
    if (!userId) return
    try {
      // Try fetching leads by task_id first, then collection_id
      let data: any = { leads: [] }
      try {
        data = await getLeadsByTaskId(col.id)
      } catch {
        try {
          data = await getCollectionLeads(col.id)
        } catch { /* fallback */ }
      }
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
  const [paystackKey, setPaystackKey] = useState<string>('')

  // Fetch Paystack public key from backend on mount
  useEffect(() => {
    fetchPaystackPublicKey().then(key => {
      if (key) setPaystackKey(key)
    })
  }, [])

  const handleBuyCoins = useCallback((pkg: typeof COIN_PACKAGES[0]) => {
    const publicKey = paystackKey || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY
    if (!publicKey || publicKey === 'pk_test_xxx' || !publicKey.startsWith('pk_')) {
      alert('Payment system is not configured yet. Please contact support or try again later.')
      return
    }

    loadPaystackScript(() => {
      const email = user?.emailAddresses?.[0]?.emailAddress
      if (!email || !userId) return

      const ref = `bd_${userId}_${Date.now()}`
      ;(window as any).PaystackPop.setup({
        key: publicKey,
        email,
        amount: pkg.price * 100, // Paystack expects amount in kobo (cents)
        currency: 'NGN',
        reference: ref,
        onClose: () => {},
        callback: async () => {
          addCoins(pkg.coins)
          setPaymentModalOpen(false)
          // Refresh balance from backend
          if (userId) {
            try {
              const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bad-decision-backend-main.onrender.com'
              const res = await fetch(`${BACKEND_URL}/api/coins/${userId}`)
              if (res.ok) {
                const data = await res.json()
                if (data.balance) {
                  setCoinBalance({
                    coins_balance: data.balance.coins_balance,
                    coins_reserved: data.balance.coins_reserved,
                    coins_lifetime: data.balance.coins_lifetime,
                  })
                }
              }
            } catch { /* silent */ }
          }
        },
      }).openIframe()
    })
  }, [user, userId, addCoins, setCoinBalance, paystackKey])

  // ============================================================
  // UPGRADE PLAN PAYMENT
  // ============================================================
  const handleUpgradePlan = useCallback(async (tier: typeof PRICING_TIERS[0]) => {
    if (tier.price === 0) return // Free tier, no payment needed

    const email = user?.emailAddresses?.[0]?.emailAddress
    if (!email || !userId) return

    try {
      const result = await initializePaystackPayment({
        user_id: userId,
        email,
        plan_type: tier.planType,
        package_id: tier.id,
      })
      // Redirect to Paystack authorization URL
      if (result.authorization_url) {
        window.location.href = result.authorization_url
      }
    } catch (err) {
      console.error('[DASHBOARD] Upgrade payment failed:', err)
      addToast('Failed to initialize payment. Please try again.', 'error')
    }
  }, [user, userId, addToast])

  // ============================================================
  // NEW SEARCH — Reset state
  // ============================================================
  const handleNewSearch = useCallback(() => {
    setSelectedEngine(null)
    setSearchQuery('')
    setLeads([])
    setLocation({ continent: '', country: '', stateRegion: '' })
    setView('search')
    setErrorMessage('')
  }, [setSelectedEngine, setSearchQuery, setLeads])

  // ============================================================
  // CURRENT ENGINE CONFIG
  // ============================================================
  const currentEngine = useMemo(
    () => ENGINE_CARDS.find(e => e.id === selectedEngine),
    [selectedEngine]
  )

  // ============================================================
  // TIER DISPLAY NAME
  // ============================================================
  const tierDisplayName = useMemo(() => {
    const tier = PRICING_TIERS.find(t => t.planType === userTier)
    return tier ? tier.name : 'Explorer'
  }, [userTier])

  // ============================================================
  // RENDER — Authenticated Dashboard
  // ============================================================
  return (
    <div className="h-screen flex bg-[var(--bg-primary)] relative overflow-hidden">
      {/* ============ TOAST NOTIFICATIONS ============ */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

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

        {/* Coin Balance + Tier Badge */}
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
            {/* Tier Badge */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-medium text-white/70">
                <Crown className="w-2.5 h-2.5" />
                {tierDisplayName} Plan
              </span>
            </div>
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
            onClick={() => setUpgradeModalOpen(true)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-[var(--color-accent)] hover:bg-[var(--bg-primary)] transition-colors flex items-center gap-2.5"
          >
            <TrendingUp className="w-4 h-4" />
            Upgrade Plan
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
                errorMessage={errorMessage}
              />
            )}
            {view === 'searching' && (
              <SearchingView
                key="searching"
                engine={currentEngine}
                query={searchQuery}
                taskStatus={taskStatus}
                location={location}
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

      {/* ============ UPGRADE MODAL ============ */}
      <AnimatePresence>
        {upgradeModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setUpgradeModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[720px] sm:max-h-[90vh] bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-2xl z-50 overflow-hidden"
            >
              <UpgradeModal
                onClose={() => setUpgradeModalOpen(false)}
                onUpgrade={handleUpgradePlan}
                currentTier={userTier}
                userId={userId}
                user={user}
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
  errorMessage,
}: {
  selectedEngine: EngineType | null
  onSelectEngine: (e: EngineType | null) => void
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  location: { continent: string; country: string; stateRegion: string }
  onLocationChange: (loc: { continent: string; country: string; stateRegion: string }) => void
  onSearch: () => void
  coinBalance: number
  errorMessage: string
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
          {/* Error Message Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200"
            >
              <Shield className="w-4 h-4 flex-shrink-0" />
              {errorMessage}
            </motion.div>
          )}

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

  // Build region options with popular section
  const popularOptions = useMemo(() => {
    const pop = locationData.filter(c => POPULAR_REGIONS.includes(c.value))
    return pop.map(c => ({ value: c.value, label: `${c.emoji} ${c.label}`, isPopular: true }))
  }, [])

  const allRegionOptions = useMemo(() => {
    const popular = popularOptions.map(o => ({ ...o }))
    const rest = locationData
      .filter(c => !POPULAR_REGIONS.includes(c.value))
      .map(c => ({ value: c.value, label: `${c.emoji} ${c.label}`, isPopular: false }))
    return [...popular, ...rest]
  }, [popularOptions])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {/* Region */}
      <Dropdown
        placeholder="Region"
        value={location.continent}
        options={allRegionOptions}
        onChange={(v) => onLocationChange({ continent: v, country: '', stateRegion: '' })}
        popularCount={popularOptions.length}
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
// GENERIC DROPDOWN (with improved UX)
// ============================================================
function Dropdown({
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  popularCount = 0,
}: {
  placeholder: string
  value: string
  options: { value: string; label: string; isPopular?: boolean }[]
  onChange: (v: string) => void
  disabled?: boolean
  popularCount?: number
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = options.find(o => o.value === value)
  const filtered = useMemo(() => {
    if (!search) return options
    return options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  }, [options, search])

  // Calculate position when opening
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top
      const dropdownHeight = 380 // approximate max height of dropdown

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        // Open upward
        setDropdownStyle({
          position: 'fixed',
          bottom: viewportHeight - rect.top + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 60,
        })
      } else {
        // Open downward (default)
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 60,
        })
      }
    }
  }, [open])

  // Auto-focus search input when opened
  useEffect(() => {
    if (open && searchInputRef.current && options.length > 8) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [open, options.length])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Split options into popular and rest for display
  const popularItems = popularCount > 0 ? filtered.filter(o => o.isPopular) : []
  const regularItems = popularCount > 0 ? filtered.filter(o => !o.isPopular) : filtered

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
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
            className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-lg overflow-hidden"
            style={{ ...dropdownStyle, boxShadow: 'var(--shadow-dropdown)' }}
          >
            {options.length > 8 && (
              <div className="p-2 border-b border-[var(--border-color)]">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
                  autoFocus
                />
              </div>
            )}
            <div className="max-h-80 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-xs text-[var(--text-tertiary)] text-center">No results</p>
              ) : (
                <>
                  {/* Popular section */}
                  {popularItems.length > 0 && (
                    <>
                      <p className="px-3 py-1.5 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Popular</p>
                      {popularItems.map(opt => (
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
                      ))}
                      <div className="my-1 mx-3 border-t border-[var(--border-color)]" />
                    </>
                  )}
                  {/* Regular items */}
                  {regularItems.map(opt => (
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
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// SEARCHING VIEW (with cycling progress messages)
// ============================================================
function SearchingView({
  engine,
  query,
  taskStatus,
  location,
}: {
  engine: EngineConfig | undefined
  query: string
  taskStatus: string
  location: { continent: string; country: string; stateRegion: string }
}) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [fadeKey, setFadeKey] = useState(0)

  // Get engine-specific messages
  const engineMessages = engine ? ENGINE_PROGRESS_MESSAGES[engine.id] : ['Processing...', 'Working...', 'Almost there...']

  // Build location-aware messages
  const messages = useMemo(() => {
    const locMessages = [...engineMessages]

    // Add a location-aware message if location is set
    if (location.country) {
      const countryName = location.country.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      locMessages.splice(1, 0, `Finding leads in ${countryName}...`)
    } else if (location.continent) {
      const continentName = location.continent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      locMessages.splice(1, 0, `Finding leads in ${continentName}...`)
    }

    return locMessages
  }, [engineMessages, location.continent, location.country])

  // Cycle through messages every 3-4 seconds
  useEffect(() => {
    if (taskStatus === 'completed' || taskStatus === 'exhausted' || taskStatus === 'failed') return

    const interval = setInterval(() => {
      setMessageIndex(prev => {
        const next = (prev + 1) % messages.length
        setFadeKey(k => k + 1)
        return next
      })
    }, 3500)

    return () => clearInterval(interval)
  }, [messages.length, taskStatus])

  // Get current message
  const currentMessage = taskStatus === 'completed' || taskStatus === 'exhausted'
    ? 'Search complete!'
    : taskStatus === 'failed'
    ? 'Search failed. Please try again.'
    : messages[messageIndex] || 'Processing...'

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
          Searching for &quot;{query}&quot;
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Using {engine?.name || 'engine'}
        </p>

        {/* Cycling progress message */}
        <div className="h-6 mb-5">
          <motion.p
            key={fadeKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-[var(--color-accent)] font-medium"
          >
            {currentMessage}
          </motion.p>
        </div>

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
                  <div className="text-[var(--text-primary)]">{lead.dm_name || '\u2014'}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">{lead.dm_position || ''}</div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-[var(--text-secondary)] text-xs truncate max-w-[180px] block">
                    {lead.verified_email || '\u2014'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <span className="text-[var(--text-secondary)] text-xs">{lead.phone || '\u2014'}</span>
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
              {'\u20A6'}{pkg.price.toLocaleString()}
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

// ============================================================
// UPGRADE MODAL
// ============================================================
function UpgradeModal({
  onClose,
  onUpgrade,
  currentTier,
  userId,
  user,
}: {
  onClose: () => void
  onUpgrade: (tier: typeof PRICING_TIERS[0]) => void
  currentTier: string
  userId: string | null
  user: any
}) {
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null)

  const handleTierClick = async (tier: typeof PRICING_TIERS[0]) => {
    if (tier.planType === 'free') return // Can't upgrade to free
    setUpgradingTier(tier.id)
    try {
      await onUpgrade(tier)
    } catch {
      setUpgradingTier(null)
    }
  }

  return (
    <div className="p-6 overflow-y-auto max-h-[90vh]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Upgrade Your Plan</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Get more searches, more leads, better results</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-surface)] flex items-center justify-center">
          <X className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRICING_TIERS.map((tier) => {
          const isCurrentTier = tier.planType === currentTier
          const isUpgrading = upgradingTier === tier.id

          return (
            <div
              key={tier.id}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${isCurrentTier
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                  : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--border-light)]'
                }
              `}
            >
              {/* Current Plan Badge */}
              {isCurrentTier && (
                <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-semibold">
                  Current Plan
                </span>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ color: tier.color, background: 'var(--bg-surface)' }}
                >
                  {tier.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[var(--text-primary)]">{tier.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)]">{tier.coins.toLocaleString()} coins/mo</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                {tier.price === 0 ? (
                  <p className="text-lg font-bold text-[var(--text-primary)]">Free</p>
                ) : (
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {'\u20A6'}{tier.price.toLocaleString()}
                    <span className="text-xs font-normal text-[var(--text-tertiary)]">/mo</span>
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-1.5 mb-4">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <CheckCircle2 className="w-3 h-3 text-[var(--color-accent)] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              {isCurrentTier ? (
                <div className="w-full py-2 rounded-lg bg-[var(--bg-surface)] text-center text-xs font-medium text-[var(--text-tertiary)]">
                  Current Plan
                </div>
              ) : tier.price === 0 ? (
                <div className="w-full py-2 rounded-lg bg-[var(--bg-surface)] text-center text-xs font-medium text-[var(--text-tertiary)]">
                  Default
                </div>
              ) : (
                <button
                  onClick={() => handleTierClick(tier)}
                  disabled={isUpgrading}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white text-xs font-semibold hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-shadow disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3 h-3" />
                      Upgrade to {tier.name}
                    </>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-4">
        Secure payment via Paystack. Cancel anytime.
      </p>
    </div>
  )
}
