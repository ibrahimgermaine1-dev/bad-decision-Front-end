'use client'

/**
 * DASHBOARD — The Matrix Shell
 * Persistent split-pane workspace.
 * Left sidebar: Smart Collections + profile (collapses on mobile).
 * Main canvas: Idle Hub, Command HUD, Results, Coin Vault, Support.
 * No emojis. Premium design. Click-driven.
 * CONNECTED TO REAL BACKEND API.
 */
import { useState, useCallback, useEffect } from 'react'
import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import { useAppStore, type AppView, type EngineType, type Lead, type SmartCollection } from '@/stores/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase-client'
import { createTask, getUserTasks, getCollectionLeads, pollTaskUntilDone } from '@/lib/backend'
import { exportLeadsToCsv, downloadCsv } from '@/lib/csv-shield'

// ============================================================
// PAYSTACK INLINE JS LOADER
// Loads Paystack Pop script dynamically — no npm package needed
// ============================================================
function loadPaystackScript(onLoad?: () => void) {
  if (typeof window === 'undefined') return
  if ((window as any).PaystackPop) {
    onLoad?.()
    return
  }
  const script = document.createElement('script')
  script.src = 'https://js.paystack.co/v2/inline.js'
  script.async = true
  script.onload = () => onLoad?.()
  document.head.appendChild(script)
}

// ============================================================
// ENGINE CONFIG (no tech jargon)
// ============================================================
const ENGINE_CARDS = [
  {
    id: 'ads_intent' as EngineType,
    title: 'Companies Running Ads',
    desc: 'Find businesses spending money on ads. They have budgets to spend on you.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    id: 'smb_maps' as EngineType,
    title: 'Local Businesses',
    desc: 'Find local businesses with phone, email, and full contact details.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'web_absent' as EngineType,
    title: 'Businesses Without Websites',
    desc: 'Find businesses with no website. They need one. You can build it.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    id: 'social_intent' as EngineType,
    title: 'People Asking For Help',
    desc: 'Find people asking for help on social media right now.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    collections, setCollections,
    selectedLead, setSelectedLead,
    inspectorOpen, setInspectorOpen,
    setAuthenticated,
    deductCoins,
  } = useAppStore()

  const { userId } = useAuth()
  const { signOut } = useClerk()
  const isNigeria = useAppStore((s) => s.userCountry) === 'NG'

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Determine active sub-view
  const activeSubView: 'idle' | 'searching' | 'results' | 'coin-vault' | 'support' | 'settings' =
    view === 'dashboard-coin-vault' ? 'coin-vault' :
    view === 'dashboard-support' ? 'support' :
    view === 'dashboard-settings' ? 'settings' :
    view === 'dashboard-results' ? 'results' :
    view === 'dashboard-searching' ? 'searching' : 'idle'

  // Refresh coin balance periodically
  useEffect(() => {
    if (!userId) return
    const interval = setInterval(async () => {
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
      } catch (err) {
        // Silently fail — don't disrupt UX
      }
    }, 15000) // Every 15 seconds
    return () => clearInterval(interval)
  }, [userId])

  // ============================================================
  // SEARCH HANDLER — REAL BACKEND API
  // ============================================================
  const handleSearch = useCallback(async () => {
    if (!selectedEngine || !searchQuery.trim() || !userId) return

    // Check coin balance before starting
    if (coinBalance.coins_balance <= 0) {
      setView('dashboard-coin-vault')
      return
    }

    setView('dashboard-searching')
    setTaskStatus('processing')

    try {
      // 1. Create task on backend
      const coinCost = tier === 'pro' ? 3 : (tier === 'starter' || tier === 'growth') ? 2 : 1
      const taskData = await createTask({
        user_id: userId,
        task_type: selectedEngine,
        query: searchQuery.trim(),
        coins_reserved: coinCost * 10, // Reserve coins for ~10 leads
      })

      const taskId = taskData.task_id || taskData.id

      // 2. Deduct coins locally (optimistic)
      deductCoins(coinCost * 10)

      // 3. Poll backend until task is complete
      const completedTask = await pollTaskUntilDone(
        userId,
        taskId,
        90, // max 90 attempts = ~4.5 minutes
        (status: string) => {
          setTaskStatus(status as any)
        }
      )

      // 4. Fetch leads for the completed task
      if (completedTask && (completedTask.status === 'completed' || completedTask.status === 'exhausted')) {
        const leadsData = await getCollectionLeads(taskId)
        if (leadsData.leads && leadsData.leads.length > 0) {
          setLeads(leadsData.leads)
        } else {
          setLeads([])
        }
      } else {
        setLeads([])
      }

      setTaskStatus('completed')
      setView('dashboard-results')

      // 5. Refresh collections list
      try {
        const tasksData = await getUserTasks(userId)
        if (tasksData.tasks) {
          const updatedCollections = tasksData.tasks.map((task: any) => ({
            id: task.id,
            name: task.query || 'Untitled Search',
            task_type: task.task_type,
            lead_count: task.lead_count || 0,
            created_at: task.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          }))
          setCollections(updatedCollections)
        }
      } catch (err) {
        // Non-critical — collections are just metadata
      }

    } catch (err: any) {
      console.error('[DASHBOARD] Search failed:', err)
      setTaskStatus('failed')
      setLeads([])
      setView('dashboard-results')
    }
  }, [selectedEngine, searchQuery, userId, tier, coinBalance, setView, setTaskStatus, setLeads, deductCoins, setCollections])

  // ============================================================
  // LOAD COLLECTION LEADS
  // ============================================================
  const handleSelectCollection = useCallback(async (collection: SmartCollection) => {
    if (!userId) return
    try {
      const leadsData = await getCollectionLeads(collection.id)
      if (leadsData.leads && leadsData.leads.length > 0) {
        setLeads(leadsData.leads)
        setSelectedEngine(collection.task_type)
        setView('dashboard-results')
        setSidebarOpen(false)
      }
    } catch (err) {
      console.error('[DASHBOARD] Failed to load collection:', err)
    }
  }, [userId, setLeads, setSelectedEngine, setView])

  // ============================================================
  // EXPORT HANDLER
  // ============================================================
  const handleExport = () => {
    if (leads.length === 0) return
    const csv = exportLeadsToCsv(leads, selectedEngine || undefined)
    downloadCsv(csv, `bad-decision-leads-${Date.now()}.csv`)
  }

  // ============================================================
  // SIGN OUT
  // ============================================================
  const handleSignOut = async () => {
    await signOut()
    setAuthenticated(false)
    setView('landing')
  }

  return (
    <div className="h-screen flex bg-[var(--bg-primary)] relative">
      {/* ============================================================ */}
      {/* MOBILE SIDEBAR OVERLAY */}
      {/* ============================================================ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============================================================ */}
      {/* LEFT SIDEBAR */}
      {/* ============================================================ */}
      <aside className={`
        w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col flex-shrink-0
        fixed md:relative inset-y-0 left-0 z-50
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-semibold text-[var(--text-primary)] text-sm">Bad Decision</span>
          </div>
          {/* Close button on mobile */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden w-8 h-8 rounded-lg hover:bg-[var(--bg-primary)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Coin Balance */}
        <div className="px-4 py-4">
          <div className="rounded-xl bg-[var(--bg-inverse)] p-4">
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-medium">Coins Remaining</p>
            <p className="text-2xl font-bold text-white mt-1">{coinBalance.coins_balance}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{coinBalance.coins_reserved} reserved</p>
          </div>
        </div>

        {/* Smart Collections */}
        <div className="flex-1 overflow-y-auto px-4">
          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Smart Collections</p>
          <div className="space-y-1">
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => handleSelectCollection(col)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="truncate">{col.name}</span>
                <span className="ml-auto text-xs text-[var(--text-secondary)]">{col.lead_count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom: Navigation + Profile */}
        <div className="border-t border-[var(--border-color)] p-4 space-y-1">
          <button
            onClick={() => { setView('dashboard-coin-vault'); setSidebarOpen(false) }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeSubView === 'coin-vault' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Coin Vault
          </button>
          <button
            onClick={() => { setView('dashboard-settings'); setSidebarOpen(false) }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeSubView === 'settings' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          <button
            onClick={() => { setView('dashboard-support'); setSidebarOpen(false) }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeSubView === 'support' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Support
          </button>
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

      {/* ============================================================ */}
      {/* MAIN CANVAS */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav */}
        <div className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(true)} className="md:hidden w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button onClick={() => setView('dashboard-idle')} className="flex items-center gap-2 text-[var(--text-primary)]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Badge tier={tier} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={leads.length === 0}
              className="border-[var(--border-color)] text-[var(--text-primary)] disabled:text-[var(--text-tertiary)] disabled:border-[var(--bg-surface)]"
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
            />
          )}
          {activeSubView === 'searching' && (
            <SearchingView engine={selectedEngine} query={searchQuery} taskStatus={taskStatus} />
          )}
          {activeSubView === 'results' && (
            <ResultsMatrix
              leads={leads}
              engineType={selectedEngine}
              onSelectLead={(lead) => {
                setSelectedLead(lead)
                setInspectorOpen(true)
              }}
            />
          )}
          {activeSubView === 'coin-vault' && <CoinVault />}
          {activeSubView === 'support' && <SupportTerminal />}
          {activeSubView === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* ============================================================ */}
      {/* CANVAS INSPECTOR (Slide-out Drawer) — Desktop Only */}
      {/* ============================================================ */}
      {inspectorOpen && selectedLead && (
        <>
          {/* Mobile overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setInspectorOpen(false)}
          />
          <aside className="fixed lg:relative right-0 top-0 lg:top-auto h-full w-full sm:w-[400px] lg:w-[30%] lg:min-w-[360px] bg-[var(--bg-secondary)] border-l border-[var(--border-color)] flex flex-col overflow-y-auto z-50 lg:z-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Contact Details</h2>
                <button onClick={() => setInspectorOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-primary)] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Company */}
              <div className="space-y-4">
                <DataField label="Company" value={selectedLead.company_name} />
                {/* For web_absent: show NO WEBSITE badge instead of generic ABSENT */}
                {selectedLead.website_url === 'NONE' || selectedLead.website_url === 'ABSENT' ? (
                  <div>
                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Website</p>
                    <div className="mt-1"><NoWebsiteBadge /></div>
                  </div>
                ) : (
                  <DataField label="Website" value={selectedLead.website_url} isLink />
                )}
                <DataField label="Decision Maker" value={selectedLead.dm_name} />
                <DataField label="Position" value={selectedLead.dm_position} />
                {/* For social_intent: don't show email if ABSENT — it's expected */}
                {!(selectedLead.engine_type === 'social_intent' && selectedLead.verified_email === 'ABSENT') && (
                  <DataField label="Verified Email" value={selectedLead.verified_email} />
                )}
                <DataField label="Phone" value={selectedLead.phone} />
                <DataField label="LinkedIn" value={selectedLead.linkedin} isLink />
                <DataField label="Instagram" value={selectedLead.instagram} isLink />

                {/* Verification Badges */}
                <Separator className="bg-[var(--border-color)]" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span className="text-sm text-[var(--text-primary)] font-medium">Live Network Status: Active</span>
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
                          <span className="text-sm text-[var(--text-primary)] font-medium">Inbox Handshake: Verified</span>
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
    </div>
  )
}

// ============================================================
// IDLE WORKSPACE — 2x2 Card Grid + Search Terminal
// ============================================================
function IdleWorkspace({
  onSelectEngine,
  selectedEngine,
  onSearch,
  searchQuery,
  setSearchQuery,
}: {
  onSelectEngine: (e: EngineType) => void
  selectedEngine: EngineType | null
  onSearch: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}) {
  const [showTerminal, setShowTerminal] = useState(false)

  return (
    <div className="h-full flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        {!showTerminal ? (
          <>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] text-center">Who Do You Want To Find?</h1>
            <p className="text-[var(--text-secondary)] text-center mt-2 mb-6 md:mb-10 text-sm md:text-base">Pick a target type and start searching.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {ENGINE_CARDS.map((engine) => (
                <button
                  key={engine.id}
                  onClick={() => {
                    onSelectEngine(engine.id)
                    setShowTerminal(true)
                  }}
                  className="group rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-primary)] p-5 md:p-8 text-left hover:border-[var(--color-accent)] transition-all"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--bg-secondary)] group-hover:bg-[var(--color-accent)]/10 flex items-center justify-center mb-3 md:mb-4 text-[var(--text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                    {engine.icon}
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm md:text-base">{engine.title}</h3>
                  <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">{engine.desc}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Search Terminal */
          <div className="rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--bg-primary)] p-5 md:p-8 shadow-lg">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                  {ENGINE_CARDS.find(e => e.id === selectedEngine)?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm md:text-base">
                    {ENGINE_CARDS.find(e => e.id === selectedEngine)?.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">Type what you are looking for</p>
                </div>
              </div>
              <button onClick={() => setShowTerminal(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex gap-3">
              <Input
                placeholder="Type what you need: Plumbers in Texas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="flex-1 h-10 md:h-12 border-[var(--border-color)] text-sm md:text-base"
                autoFocus
              />
              <Button onClick={onSearch} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-4 md:px-8 h-10 md:h-12 font-semibold text-sm md:text-base">
                Search
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// SEARCHING VIEW — Ghost Rows + Telemetry Ticker
// ============================================================
function SearchingView({ engine, query, taskStatus }: { engine: EngineType | null; query: string; taskStatus: string }) {
  const statusText = {
    pending: 'GETTING YOUR SEARCH READY...',
    processing: 'CHECKING EMAILS AGAINST REAL MAIL SERVERS...',
    idle: 'STARTING UP...',
  }

  return (
    <div className="h-full flex flex-col">
      {/* Ghost Row Table */}
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Company</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Website</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden sm:table-cell">Decision Maker</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden md:table-cell">Verified Email</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--border-color)] last:border-0">
                      <td className="px-4 py-4"><div className="h-4 bg-[var(--bg-surface)] rounded pulse-row w-32" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-[var(--bg-surface)] rounded pulse-row w-28" /></td>
                      <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 bg-[var(--bg-surface)] rounded pulse-row w-24" /></td>
                      <td className="px-4 py-4 hidden md:table-cell"><div className="h-4 bg-[var(--bg-surface)] rounded pulse-row w-36" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Ticker */}
      <div className="bg-[var(--bg-inverse)] px-4 md:px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <span className="text-[var(--color-accent)] font-mono text-xs md:text-sm font-semibold">[ WORKING ]</span>
        <span className="text-[var(--text-tertiary)] font-mono text-xs md:text-sm truncate">
          {statusText[taskStatus as keyof typeof statusText] || 'CHECKING EMAILS AGAINST REAL MAIL SERVERS...'}
        </span>
        <span className="cursor-blink text-[var(--color-accent)] font-mono hidden sm:inline">_</span>
      </div>
    </div>
  )
}

// ============================================================
// RESULTS MATRIX — Engine-Aware Data Display
// ============================================================
function ResultsMatrix({ leads, engineType, onSelectLead }: { leads: Lead[]; engineType: EngineType | null; onSelectLead: (l: Lead) => void }) {
  // Determine the active engine type — prefer the prop, fall back to lead data
  const activeEngine = engineType || (leads.length > 0 && leads[0].engine_type ? leads[0].engine_type : null) as EngineType | null

  if (leads.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">No Results Found</h2>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">This search did not find any verified contacts. Try different words or a different search type.</p>
        </div>
      </div>
    )
  }

  // Render engine-specific card layouts for social_intent and web_absent
  if (activeEngine === 'social_intent') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Results</h2>
                <p className="text-sm text-[var(--text-secondary)]">{leads.length} people asking for help</p>
              </div>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {leads.map((lead, idx) => (
                <SocialIntentCard key={lead.domain_hash || idx} lead={lead} onClick={() => onSelectLead(lead)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeEngine === 'web_absent') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Results</h2>
                <p className="text-sm text-[var(--text-secondary)]">{leads.length} businesses need a website</p>
              </div>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {leads.map((lead, idx) => (
                <WebAbsentCard key={lead.domain_hash || idx} lead={lead} onClick={() => onSelectLead(lead)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Table layout for smb_maps and ads_intent
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Results</h2>
              <p className="text-sm text-[var(--text-secondary)]">{leads.length} verified contacts</p>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <EngineTableHead engineType={activeEngine} />
                </thead>
                <tbody>
                  {leads.map((lead, idx) => (
                    <EngineTableRow
                      key={lead.domain_hash || idx}
                      lead={lead}
                      engineType={activeEngine}
                      onClick={() => onSelectLead(lead)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ENGINE-SPECIFIC TABLE HEADERS
// ============================================================
function EngineTableHead({ engineType }: { engineType: EngineType | null }) {
  if (engineType === 'smb_maps') {
    return (
      <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Company Name</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden sm:table-cell">Address</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Phone</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden md:table-cell">Email</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden lg:table-cell">Category</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden lg:table-cell">Rating</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden xl:table-cell">Source</th>
      </tr>
    )
  }

  if (engineType === 'ads_intent') {
    return (
      <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Company Name</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden sm:table-cell">Website</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Ad Platform</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden md:table-cell">Ad Snippet</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Email</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden lg:table-cell">Phone</th>
      </tr>
    )
  }

  // Default fallback (same columns as before)
  return (
    <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Company</th>
      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Website</th>
      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden sm:table-cell">Decision Maker</th>
      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide hidden md:table-cell">Position</th>
      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Verified Email</th>
    </tr>
  )
}

// ============================================================
// ENGINE-SPECIFIC TABLE ROW
// ============================================================
function EngineTableRow({ lead, engineType, onClick }: { lead: Lead; engineType: EngineType | null; onClick: () => void }) {
  if (engineType === 'smb_maps') {
    const category = lead.engine_data?.category || lead.engine_data?.business_type || ''
    const rating = lead.engine_data?.rating || ''
    return (
      <tr
        onClick={onClick}
        className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors"
      >
        <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
          {lead.company_name !== 'ABSENT' ? lead.company_name : <AbsentBadge />}
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">
          {lead.address && lead.address !== 'ABSENT' ? <span className="truncate block max-w-[200px]">{lead.address}</span> : <AbsentBadge />}
        </td>
        <td className="px-4 py-3 text-sm">
          {lead.phone && lead.phone !== 'ABSENT' ? (
            <span className="text-[var(--text-primary)]">{lead.phone}</span>
          ) : (
            <AbsentBadge />
          )}
        </td>
        <td className="px-4 py-3 text-sm hidden md:table-cell">
          {lead.verified_email !== 'ABSENT' ? (
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-primary)]">{lead.verified_email}</span>
              {lead.is_catchall && <CatchAllBadge />}
            </div>
          ) : (
            <AbsentBadge />
          )}
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">
          {category || <AbsentBadge />}
        </td>
        <td className="px-4 py-3 text-sm hidden lg:table-cell">
          {rating ? (
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#D97706]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[var(--text-primary)]">{rating}</span>
            </div>
          ) : (
            <AbsentBadge />
          )}
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden xl:table-cell">
          {lead.discovery_source || 'Google Maps'}
        </td>
      </tr>
    )
  }

  if (engineType === 'ads_intent') {
    const adSnippet = lead.intent_text || lead.engine_data?.ad_snippet || lead.engine_data?.ad_text || ''
    return (
      <tr
        onClick={onClick}
        className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors"
      >
        <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
          {lead.company_name !== 'ABSENT' ? lead.company_name : <AbsentBadge />}
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">
          {lead.website_url !== 'ABSENT' && lead.website_url !== 'NONE' ? lead.website_url : <AbsentBadge />}
        </td>
        <td className="px-4 py-3 text-sm">
          <AdPlatformBadge platform={lead.ad_platform || lead.engine_data?.ad_platform || ''} />
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
          {adSnippet ? (
            <span className="truncate block max-w-[200px]" title={adSnippet}>{adSnippet}</span>
          ) : (
            <AbsentBadge />
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {lead.verified_email !== 'ABSENT' ? (
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-primary)]">{lead.verified_email}</span>
              {lead.is_catchall && <CatchAllBadge />}
            </div>
          ) : (
            <AbsentBadge />
          )}
        </td>
        <td className="px-4 py-3 text-sm hidden lg:table-cell">
          {lead.phone && lead.phone !== 'ABSENT' ? (
            <span className="text-[var(--text-primary)]">{lead.phone}</span>
          ) : (
            <AbsentBadge />
          )}
        </td>
      </tr>
    )
  }

  // Default fallback row
  return (
    <tr
      onClick={onClick}
      className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors"
    >
      <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
        {lead.company_name !== 'ABSENT' ? lead.company_name : <AbsentBadge />}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
        {lead.website_url !== 'ABSENT' ? lead.website_url : <AbsentBadge />}
      </td>
      <td className="px-4 py-3 text-sm hidden sm:table-cell">
        {lead.dm_name !== 'ABSENT' ? (
          <span className="text-[var(--text-primary)]">{lead.dm_name}</span>
        ) : (
          <AbsentBadge />
        )}
      </td>
      <td className="px-4 py-3 text-sm hidden md:table-cell">
        {lead.dm_position !== 'ABSENT' ? (
          <span className="text-[var(--text-secondary)]">{lead.dm_position}</span>
        ) : (
          <AbsentBadge />
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {lead.verified_email !== 'ABSENT' ? (
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-primary)]">{lead.verified_email}</span>
            {lead.is_catchall && <CatchAllBadge />}
          </div>
        ) : (
          <AbsentBadge />
        )}
      </td>
    </tr>
  )
}

// ============================================================
// SOCIAL INTENT CARD — Social-post-style card layout
// ============================================================
function SocialIntentCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const platform = lead.platform || lead.engine_data?.platform || 'Social'
  const intentText = lead.intent_text || lead.engine_data?.intent_text || lead.engine_data?.post_text || ''
  const timeSensitivity = lead.engine_data?.time_sensitivity || lead.engine_data?.urgency || ''
  const postUrl = lead.engine_data?.post_url || lead.aggregator_url || ''
  const posterName = lead.dm_name !== 'ABSENT' ? lead.dm_name : lead.company_name !== 'ABSENT' ? lead.company_name : 'Anonymous'

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 hover:border-[var(--color-accent)] hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-[var(--color-accent)]">{posterName.charAt(0).toUpperCase()}</span>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[var(--text-primary)]">{posterName}</span>
            <PlatformBadge platform={platform} />
            {timeSensitivity && <TimeSensitivityBadge level={timeSensitivity} />}
          </div>
          {intentText && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2 line-clamp-3">{intentText}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            {postUrl && postUrl !== 'ABSENT' && (
              <span className="text-[var(--color-accent)] hover:underline truncate max-w-[200px] inline-block">
                View Post
              </span>
            )}
            {lead.phone && lead.phone !== 'ABSENT' && (
              <span>{lead.phone}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ============================================================
// WEB ABSENT CARD — "Needs Website" card layout
// ============================================================
function WebAbsentCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const aggregatorSource = lead.aggregator_source || lead.engine_data?.aggregator_source || ''
  const digitalPresenceScore = lead.engine_data?.digital_presence_score ?? lead.engine_data?.presence_score ?? null
  const opportunity = lead.engine_data?.opportunity || lead.engine_data?.opportunity_type || ''

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 hover:border-[var(--color-accent)] hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {lead.company_name !== 'ABSENT' ? lead.company_name : 'Unknown Business'}
            </span>
            <NoWebsiteBadge />
          </div>
          {lead.address && lead.address !== 'ABSENT' && (
            <p className="text-xs text-[var(--text-secondary)] mb-2 truncate">{lead.address}</p>
          )}
          <div className="flex items-center gap-3 text-xs">
            {aggregatorSource && (
              <span className="inline-flex items-center rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] px-2 py-0.5 font-medium">
                {aggregatorSource}
              </span>
            )}
            {digitalPresenceScore !== null && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                digitalPresenceScore <= 30 ? 'bg-[#DCFCE7] text-[#16A34A]' : digitalPresenceScore <= 60 ? 'bg-[#FEF08A] text-[#D97706]' : 'bg-[#FEE2E2] text-[#DC2626]'
              }`}>
                Presence: {digitalPresenceScore}%
              </span>
            )}
            {opportunity && (
              <span className="inline-flex items-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 font-medium">
                {opportunity}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {lead.phone && lead.phone !== 'ABSENT' && (
            <span className="text-xs text-[var(--text-primary)] font-medium">{lead.phone}</span>
          )}
          {lead.verified_email !== 'ABSENT' && (
            <span className="text-xs text-[var(--color-accent)]">{lead.verified_email}</span>
          )}
        </div>
      </div>
    </button>
  )
}

// ============================================================
// ENGINE-SPECIFIC BADGES
// ============================================================
function NoWebsiteBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#DC2626] text-white text-xs font-bold px-2 py-0.5 uppercase tracking-wide">
      NO WEBSITE
    </span>
  )
}

function AdPlatformBadge({ platform }: { platform: string }) {
  if (!platform) return <AbsentBadge />
  const colors: Record<string, string> = {
    'Google Ads': 'bg-[#FEF08A] text-[#854D0E] border-[#EAB308]/20',
    'Meta Ads': 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20',
    'Facebook Ads': 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20',
    'TikTok Ads': 'bg-[#FECACA] text-[#DC2626] border-[#DC2626]/20',
    'LinkedIn Ads': 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20',
  }
  const colorClass = colors[platform] || 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)]'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
      {platform}
    </span>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    'Reddit': 'bg-[#FF6900]/10 text-[#FF6900]',
    'Twitter': 'bg-[#1DA1F2]/10 text-[#1DA1F2]',
    'X': 'bg-[#1DA1F2]/10 text-[#1DA1F2]',
    'Facebook': 'bg-[#1877F2]/10 text-[#1877F2]',
    'LinkedIn': 'bg-[#0A66C2]/10 text-[#0A66C2]',
    'Quora': 'bg-[#B92B27]/10 text-[#B92B27]',
  }
  const colorClass = colors[platform] || 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
      {platform}
    </span>
  )
}

function TimeSensitivityBadge({ level }: { level: string }) {
  const normalized = level.toLowerCase()
  const isUrgent = normalized.includes('urgent') || normalized.includes('high') || normalized === 'now'
  const isMedium = normalized.includes('medium') || normalized.includes('moderate')
  const colorClass = isUrgent
    ? 'bg-[#FEE2E2] text-[#DC2626]'
    : isMedium
      ? 'bg-[#FEF08A] text-[#D97706]'
      : 'bg-[#DCFCE7] text-[#16A34A]'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
      {isUrgent ? 'Urgent' : isMedium ? 'Medium' : 'Low'}
    </span>
  )
}

// ============================================================
// COIN VAULT — Billing Page
// ============================================================
function CoinVault() {
  const { coinBalance, addCoins, userCountry, setView } = useAppStore()
  const { userId } = useAuth()
  const isNigeria = userCountry === 'NG'

  const packs = [
    { coins: 500, usd: 2, ngn: 2500 },
    { coins: 1500, usd: 5, ngn: 6500 },
    { coins: 3000, usd: 9, ngn: 12000 },
    { coins: 5000, usd: 14, ngn: 18000 },
  ]

  const maxCoins = Math.max(coinBalance.coins_lifetime, 5000)
  const progress = Math.min((coinBalance.coins_balance / maxCoins) * 100, 100)

  const handlePurchase = async (pack: typeof packs[0]) => {
    if (!userId) return

    const amount = isNigeria ? pack.ngn : pack.usd
    const currency = isNigeria ? 'NGN' : 'USD'
    const amountInKobo = isNigeria ? pack.ngn * 100 : pack.usd * 100

    // Use Paystack Pop (inline JS) — no npm package needed
    if (typeof window !== 'undefined' && (window as any).PaystackPop) {
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: '', // Will be filled from user profile
        amount: amountInKobo,
        currency,
        ref: `bd_${userId}_${pack.coins}_${Date.now()}`,
        metadata: {
          user_id: userId,
          coins: pack.coins,
          custom_fields: [
            { display_name: 'Coins', variable_name: 'coins', value: pack.coins },
          ],
        },
        onClose: () => {
          console.log('[PAYSTACK] Payment window closed')
        },
        callback: (response: any) => {
          console.log('[PAYSTACK] Payment success:', response.reference)
          // Paystack webhook will handle coin addition on server side
          // Optimistically add coins locally
          addCoins(pack.coins)
        },
      })
      handler.openIframe()
    } else {
      // Paystack script not loaded yet — load it first
      loadPaystackScript(() => {
        handlePurchase(pack)
      })
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Coin Vault</h1>
      <p className="text-[var(--text-secondary)] mt-1 text-sm md:text-base">Manage your coin balance and purchase top-ups.</p>

      {/* Progress Bar */}
      <div className="mt-6 md:mt-8 rounded-2xl border border-[var(--border-color)] p-4 md:p-6 bg-[var(--bg-primary)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[var(--text-primary)]">Coins Remaining</span>
          <span className="text-sm text-[var(--text-secondary)]">{coinBalance.coins_balance} / {coinBalance.coins_lifetime} lifetime</span>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[var(--text-secondary)]">{coinBalance.coins_reserved} reserved in active searches</span>
        </div>
      </div>

      {/* Top-Up Cards */}
      <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {packs.map((pack) => (
          <div key={pack.coins} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 md:p-6 text-center">
            <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{pack.coins.toLocaleString()}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">coins</p>
            <p className="text-xl font-semibold text-[var(--text-primary)] mt-3">
              {isNigeria ? `N${pack.ngn.toLocaleString()}` : `$${pack.usd}`}
            </p>
            <Button
              onClick={() => handlePurchase(pack)}
              className="mt-4 w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold"
            >
              Buy with Paystack
            </Button>
          </div>
        ))}
      </div>

      {/* Receipt History */}
      <div className="mt-6 md:mt-8">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Receipt History</h2>
        <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Coins</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border-color)]">
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">2026-05-30</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">Free trial credits</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#16A34A]">+250</td>
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

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Support Terminal</h1>
      <p className="text-[var(--text-secondary)] mt-1 text-sm md:text-base">Get help or submit a ticket.</p>

      {/* Ticket History */}
      <div className="mt-6 md:mt-8">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Active Tickets</h2>
        <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Ticket ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-6 text-sm text-[var(--text-secondary)] text-center" colSpan={3}>No active tickets</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* New Ticket */}
      <div className="mt-6 md:mt-8">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Submit New Ticket</h2>
        {submitted ? (
          <div className="rounded-xl bg-[#DCFCE7] border border-[#16A34A]/20 p-4">
            <p className="text-sm text-[#16A34A] font-medium">Ticket submitted. We will respond within 4 hours.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border-color)] p-4 md:p-6 bg-[var(--bg-primary)] space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Subject</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" className="border-[var(--border-color)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Message</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what happened..." className="border-[var(--border-color)] min-h-[100px]" />
            </div>
            <Button onClick={() => setSubmitted(true)} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold">
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
    free: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]',
    starter: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20',
    growth: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20',
    pro: 'bg-[var(--bg-inverse)] text-white border-[var(--bg-inverse)]',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 md:px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[tier] || styles.free}`}>
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

// ============================================================
// SETTINGS VIEW — Account Settings, Billing, Tier Display
// ============================================================
function SettingsView() {
  const { tier, coinBalance, userCountry } = useAppStore()
  const { user } = useUser()
  const isNigeria = userCountry === 'NG'

  const tierLabels: Record<string, { label: string; color: string }> = {
    free: { label: 'Free', color: 'bg-[var(--text-secondary)] text-white' },
    starter: { label: 'Starter', color: 'bg-[var(--color-accent)] text-white' },
    growth: { label: 'Growth', color: 'bg-[var(--color-accent)] text-white' },
    pro: { label: 'Pro', color: 'bg-[var(--bg-inverse)] text-white' },
  }

  const currentTier = tierLabels[tier] || tierLabels.free

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Account Settings</h1>
      <p className="text-[var(--text-secondary)] mt-1 text-sm md:text-base">Manage your account, billing, and subscription.</p>

      {/* Profile */}
      <div className="mt-6 md:mt-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 md:p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Name</p>
            <p className="text-sm text-[var(--text-primary)] mt-1 font-medium">{user?.fullName || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Email</p>
            <p className="text-sm text-[var(--text-primary)] mt-1 font-medium">{user?.emailAddresses?.[0]?.emailAddress || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="mt-4 md:mt-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 md:p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${currentTier.color}`}>
              {currentTier.label}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">Current Plan</span>
          </div>
          <Button variant="outline" size="sm" className="border-[var(--border-color)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10" onClick={() => useAppStore.getState().setView('pricing')}>
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Coin Balance */}
      <div className="mt-4 md:mt-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 md:p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Coin Balance</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Available</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{coinBalance.coins_balance}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Reserved</p>
            <p className="text-2xl font-bold text-[#D97706] mt-1">{coinBalance.coins_reserved}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Lifetime</p>
            <p className="text-2xl font-bold text-[var(--color-accent)] mt-1">{coinBalance.coins_lifetime}</p>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="mt-4 md:mt-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 md:p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Billing History</h2>
        <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Coins</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border-color)]">
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">2026-05-30</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">Free trial credits</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{isNigeria ? '₦0' : '$0'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#16A34A]">+250</td>
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

function DataField({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  const isAbsent = !value || value === 'ABSENT'
  return (
    <div>
      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">{label}</p>
      {isAbsent ? (
        <div className="mt-1"><AbsentBadge /></div>
      ) : isLink ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-[var(--color-accent)] hover:underline block">
          {value}
        </a>
      ) : (
        <p className="mt-1 text-sm text-[var(--text-primary)]">{value}</p>
      )}
    </div>
  )
}
