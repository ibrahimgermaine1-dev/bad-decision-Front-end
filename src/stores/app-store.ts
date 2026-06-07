/**
 * BAD DECISION AI — Global App Store (Zustand)
 * Single source of truth for all UI state.
 */
import { create } from 'zustand'

export type ViewName =
  | 'landing'
  | 'signup'
  | 'signin'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'dashboard-idle'
  | 'dashboard-searching'
  | 'dashboard-results'
  | 'dashboard-coin-vault'
  | 'dashboard-support'

export type EngineType = 'ads_intent' | 'smb_maps' | 'web_absent' | 'social_intent'
export type TierName = 'free' | 'starter' | 'growth' | 'pro'

export interface CoinBalance {
  coins_balance: number
  coins_reserved: number
  coins_lifetime: number
}

export interface Collection {
  id: string
  name: string
  task_type: EngineType
  lead_count: number
  created_at: string
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

interface AppState {
  // View routing
  view: ViewName
  setView: (view: ViewName) => void

  // Auth
  authenticated: boolean
  setAuthenticated: (v: boolean) => void

  // User data
  userCountry: string
  setUserCountry: (v: string) => void
  coinBalance: CoinBalance
  setCoinBalance: (v: CoinBalance) => void
  tier: TierName
  setTier: (v: TierName) => void

  // Collections
  collections: Collection[]
  setCollections: (v: Collection[]) => void
  selectedCollectionId: string | null
  setSelectedCollectionId: (v: string | null) => void

  // Search
  selectedEngine: EngineType
  setSelectedEngine: (v: EngineType) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  taskStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'failed' | 'exhausted'
  setTaskStatus: (v: 'idle' | 'pending' | 'processing' | 'completed' | 'failed' | 'exhausted') => void
  currentTaskId: string | null
  setCurrentTaskId: (v: string | null) => void

  // Leads
  leads: Lead[]
  setLeads: (v: Lead[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  // View routing
  view: 'landing',
  setView: (view) => set({ view }),

  // Auth
  authenticated: false,
  setAuthenticated: (authenticated) => set({ authenticated }),

  // User data
  userCountry: 'US',
  setUserCountry: (userCountry) => set({ userCountry }),
  coinBalance: { coins_balance: 0, coins_reserved: 0, coins_lifetime: 0 },
  setCoinBalance: (coinBalance) => set({ coinBalance }),
  tier: 'free',
  setTier: (tier) => set({ tier }),

  // Collections
  collections: [],
  setCollections: (collections) => set({ collections }),
  selectedCollectionId: null,
  setSelectedCollectionId: (selectedCollectionId) => set({ selectedCollectionId }),

  // Search
  selectedEngine: 'ads_intent',
  setSelectedEngine: (selectedEngine) => set({ selectedEngine }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  taskStatus: 'idle',
  setTaskStatus: (taskStatus) => set({ taskStatus }),
  currentTaskId: null,
  setCurrentTaskId: (currentTaskId) => set({ currentTaskId }),

  // Leads
  leads: [],
  setLeads: (leads) => set({ leads }),
}))
