/**
 * Bad Decision AI — Application Store
 * Uses UNIFIED SCHEMA: profiles, usage_ledger, tasks, etc.
 * Integrates with Clerk for real authentication.
 * Falls back to demo mode when Clerk is not configured.
 */
import { create } from 'zustand'

// ============================================================
// TYPES
// ============================================================
export type AppView =
  | 'landing' | 'pricing' | 'faq' | 'contact' | 'solutions'
  | 'signup' | 'signin'
  | 'dashboard-idle' | 'dashboard-searching' | 'dashboard-results'
  | 'dashboard-coin-vault' | 'dashboard-support'

export type UserTier = 'free' | 'starter' | 'growth' | 'pro'
export type EngineType = 'ads_intent' | 'smb_maps' | 'web_absent' | 'social_intent'
export type TaskStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'exhausted' | 'failed'

export interface CoinBalance {
  balance: number
  coins_reserved: number
  total_purchased: number
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

export interface CoinTransaction {
  id: string
  amount: number
  transaction_type: string
  description: string
  reference_id?: string
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
  clerkId: string | null
  setClerkId: (id: string | null) => void
  userEmail: string | null
  setUserEmail: (email: string | null) => void
  userName: string | null
  setUserName: (name: string | null) => void
  tier: UserTier
  setTier: (tier: UserTier) => void
  userCountry: string
  setUserCountry: (country: string) => void

  // Coins (matches usage_ledger schema)
  coinBalance: CoinBalance
  setCoinBalance: (balance: CoinBalance) => void
  deductCoins: (amount: number) => void
  addCoins: (amount: number) => void

  // Transactions
  transactions: CoinTransaction[]
  setTransactions: (transactions: CoinTransaction[]) => void

  // Search/Tasks
  selectedEngine: EngineType | null
  setSelectedEngine: (engine: EngineType | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  taskStatus: TaskStatus
  setTaskStatus: (status: TaskStatus) => void
  currentTaskId: string | null
  setCurrentTaskId: (taskId: string | null) => void

  // Data
  leads: Lead[]
  setLeads: (leads: Lead[]) => void
  collections: SmartCollection[]
  setCollections: (collections: SmartCollection[]) => void
  selectedLead: Lead | null
  setSelectedLead: (lead: Lead | null) => void
  inspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void

  // Sync from backend
  syncFromBackend: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'landing',
  setView: (view) => set({ view }),
  isAuthenticated: false,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  clerkId: null,
  setClerkId: (clerkId) => set({ clerkId }),
  userEmail: null,
  setUserEmail: (userEmail) => set({ userEmail }),
  userName: null,
  setUserName: (userName) => set({ userName }),
  tier: 'free',
  setTier: (tier) => set({ tier }),
  userCountry: 'NG',
  setUserCountry: (userCountry) => set({ userCountry }),

  coinBalance: { balance: 0, coins_reserved: 0, total_purchased: 0 },
  setCoinBalance: (coinBalance) => set({ coinBalance }),
  deductCoins: (amount) =>
    set((state) => ({
      coinBalance: {
        ...state.coinBalance,
        balance: Math.max(0, state.coinBalance.balance - amount),
        coins_reserved: Math.max(0, state.coinBalance.coins_reserved - amount),
      },
    })),
  addCoins: (amount) =>
    set((state) => ({
      coinBalance: {
        ...state.coinBalance,
        balance: state.coinBalance.balance + amount,
        total_purchased: state.coinBalance.total_purchased + amount,
      },
    })),

  transactions: [],
  setTransactions: (transactions) => set({ transactions }),

  selectedEngine: null,
  setSelectedEngine: (selectedEngine) => set({ selectedEngine }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  taskStatus: 'idle',
  setTaskStatus: (taskStatus) => set({ taskStatus }),
  currentTaskId: null,
  setCurrentTaskId: (currentTaskId) => set({ currentTaskId }),

  leads: [],
  setLeads: (leads) => set({ leads }),
  collections: [],
  setCollections: (collections) => set({ collections }),
  selectedLead: null,
  setSelectedLead: (selectedLead) => set({ selectedLead }),
  inspectorOpen: false,
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),

  // Sync user data from backend API
  syncFromBackend: async () => {
    const { clerkId } = get();
    if (!clerkId) return;

    try {
      const res = await fetch(`/api/user?clerk_id=${encodeURIComponent(clerkId)}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data.profile) {
        set({
          tier: data.profile.tier,
          userCountry: data.profile.country,
          userName: data.profile.full_name,
        });
      }
      if (data.ledger) {
        set({ coinBalance: data.ledger });
      }
      if (data.collections) {
        set({ collections: data.collections });
      }

      // Also fetch transactions
      const txRes = await fetch(`/api/coins?clerk_id=${encodeURIComponent(clerkId)}`);
      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData.transactions) {
          set({ transactions: txData.transactions });
        }
      }
    } catch (error) {
      console.error('[Store] Failed to sync from backend:', error);
    }
  },
}))
