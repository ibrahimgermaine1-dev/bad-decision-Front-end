/**
 * Bad Decision — Application Store
 * Manages navigation, credits, search, and dashboard state
 * Updated for real Clerk auth (isAuthenticated removed — use useAuth() instead)
 */
import { create } from 'zustand'

// ============================================================
// TYPES
// ============================================================
export type AppView =
  | 'landing' | 'pricing' | 'faq' | 'contact'
  | 'signup' | 'signin'
  | 'dashboard-idle' | 'dashboard-searching' | 'dashboard-results'
  | 'dashboard-credit-vault' | 'dashboard-support'

export type UserTier = 'free' | 'starter' | 'growth' | 'pro'
export type EngineType = 'ads_intent' | 'smb_maps' | 'web_absent' | 'social_intent'
export type TaskStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'exhausted' | 'failed'

export interface CreditBalance {
  credits_balance: number
  credits_reserved: number
  total_purchased: number
}

export interface Lead {
  id?: string
  domain_hash: string
  company_name: string
  website_url: string
  dm_name: string
  dm_position: string
  verified_email: string
  is_catchall: boolean
  linkedin: string
  instagram: string
  facebook?: string
  phone: string
  ad_platform?: string
  address?: string
  aggregator_source?: string
  aggregator_url?: string
  platform?: string
  intent_text?: string
  validation_gates_passed?: number
  // New engine-specific fields
  rating?: number | null
  review_count?: number | null
  category?: string | null
  ad_status?: string | null
  aggregator_rating?: number | null
  intent_level?: string | null
  post_url?: string | null
  author_username?: string | null
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

  // User
  tier: UserTier
  setTier: (tier: UserTier) => void
  userCountry: string
  setUserCountry: (country: string) => void

  // Credits
  creditBalance: CreditBalance
  setCreditBalance: (balance: CreditBalance) => void
  deductCredits: (amount: number) => void
  addCredits: (amount: number) => void

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

  tier: 'free',
  setTier: (tier) => set({ tier }),
  userCountry: 'NG',
  setUserCountry: (userCountry) => set({ userCountry }),

  creditBalance: { credits_balance: 0, credits_reserved: 0, total_purchased: 0 },
  setCreditBalance: (creditBalance) => set({ creditBalance }),
  deductCredits: (amount) =>
    set((state) => ({
      creditBalance: {
        ...state.creditBalance,
        credits_balance: Math.max(0, state.creditBalance.credits_balance - amount),
        credits_reserved: state.creditBalance.credits_reserved + amount,
      },
    })),
  addCredits: (amount) =>
    set((state) => ({
      creditBalance: {
        ...state.creditBalance,
        credits_balance: state.creditBalance.credits_balance + amount,
        total_purchased: state.creditBalance.total_purchased + amount,
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
