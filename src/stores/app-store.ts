/**
 * Bad Decision AI — Application Store
 * Manages navigation, coins, search, and dashboard state
 */
import { create } from 'zustand'

// ============================================================
// TYPES
// ============================================================
export type AppView =
  | 'landing' | 'pricing' | 'faq' | 'contact'
  | 'signup' | 'signin'
  | 'dashboard-idle' | 'dashboard-searching' | 'dashboard-results'
  | 'dashboard-coin-vault' | 'dashboard-support'

export type UserTier = 'free' | 'starter' | 'growth' | 'pro'
export type EngineType = 'ads_intent' | 'smb_maps' | 'web_absent' | 'social_intent'
export type TaskStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'exhausted' | 'failed'

export interface CoinBalance {
  coins_balance: number
  coins_reserved: number
  coins_lifetime: number
}

export interface Lead {
  domain_hash: string
  company_name: string
  website_url: string
  dm_name: string
  dm_position: string
  verified_email: string
  is_catchall: boolean
  linkedin: string
  instagram: string
  phone: string
  ad_platform?: string
  address?: string
  aggregator_source?: string
  aggregator_url?: string
  platform?: string
  intent_text?: string
}

export interface SmartCollection {
  id: string
  name: string
  task_type: EngineType
  lead_count: number
  created_at: string
}

// ============================================================
// STORE
// ============================================================
interface AppState {
  // Navigation
  view: AppView
  setView: (view: AppView) => void
  isAuthenticated: boolean
  setAuthenticated: (val: boolean) => void

  // User
  tier: UserTier
  setTier: (tier: UserTier) => void
  userCountry: string
  setUserCountry: (country: string) => void

  // Coins
  coinBalance: CoinBalance
  setCoinBalance: (balance: CoinBalance) => void
  deductCoins: (amount: number) => void
  addCoins: (amount: number) => void

  // Search
  selectedEngine: EngineType | null
  setSelectedEngine: (engine: EngineType | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  taskStatus: TaskStatus
  setTaskStatus: (status: TaskStatus) => void

  // Data
  leads: Lead[]
  setLeads: (leads: Lead[]) => void
  collections: SmartCollection[]
  setCollections: (collections: SmartCollection[]) => void
  selectedLead: Lead | null
  setSelectedLead: (lead: Lead | null) => void
  inspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'landing',
  setView: (view) => set({ view }),
  isAuthenticated: false,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  tier: 'free',
  setTier: (tier) => set({ tier }),
  userCountry: 'NG',
  setUserCountry: (userCountry) => set({ userCountry }),

  coinBalance: { coins_balance: 0, coins_reserved: 0, coins_lifetime: 0 },
  setCoinBalance: (coinBalance) => set({ coinBalance }),
  deductCoins: (amount) =>
    set((state) => ({
      coinBalance: {
        ...state.coinBalance,
        coins_balance: Math.max(0, state.coinBalance.coins_balance - amount),
        coins_reserved: state.coinBalance.coins_reserved + amount,
      },
    })),
  addCoins: (amount) =>
    set((state) => ({
      coinBalance: {
        ...state.coinBalance,
        coins_balance: state.coinBalance.coins_balance + amount,
        coins_lifetime: state.coinBalance.coins_lifetime + amount,
      },
    })),

  selectedEngine: null,
  setSelectedEngine: (selectedEngine) => set({ selectedEngine }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  taskStatus: 'idle',
  setTaskStatus: (taskStatus) => set({ taskStatus }),

  leads: [],
  setLeads: (leads) => set({ leads }),
  collections: [],
  setCollections: (collections) => set({ collections }),
  selectedLead: null,
  setSelectedLead: (selectedLead) => set({ selectedLead }),
  inspectorOpen: false,
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
}))
