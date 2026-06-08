/**
 * BAD DECISION AI — Dashboard Shell
 * The main workspace where users search for leads and manage collections.
 *
 * Uses the FastAPI backend directly — no Supabase client in the frontend.
 * All data flows through the backend API for consistency.
 *
 * TABLE: coin_balances (NOT usage_ledger!)
 * Backend GET /api/coins/{user_id} returns mapped column names:
 *   coins_balance (from balance), coins_reserved, coins_lifetime (from total_purchased)
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth, useUser, UserButton, SignOutButton } from '@clerk/nextjs'
import { useAppStore, type EngineType, type Lead, type Collection } from '@/stores/app-store'
import { createTask, getUserTasks, getCollectionLeads, getUserCollections, addCoins, pollTaskUntilDone } from '@/lib/backend'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bad-decision-backend-main.onrender.com'

// ── Engine config ──────────────────────────────────────────────────────────────

const ENGINES: { type: EngineType; label: string; icon: string; desc: string }[] = [
  { type: 'ads_intent', label: 'Ads Intelligence', icon: '🎯', desc: 'Businesses running ads' },
  { type: 'smb_maps', label: 'Local SMB Maps', icon: '📍', desc: 'Brick-and-mortar shops' },
  { type: 'web_absent', label: 'Web-Absent', icon: '🔍', desc: 'No website, on aggregators' },
  { type: 'social_intent', label: 'Social Radar', icon: '💬', desc: 'Live social demand' },
]

/**
 * Load Paystack Inline JS from CDN if not already loaded.
 * No npm package needed — the official Paystack approach.
 * CDN: https://js.paystack.co/v2/inline.js
 */
function getPaystackPOP(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) {
      resolve((window as any).PaystackPop)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v2/inline.js'
    script.async = true
    script.onload = () => {
      setTimeout(() => {
        if ((window as any).PaystackPop) {
          resolve((window as any).PaystackPop)
        } else {
          reject(new Error('PaystackPop not found after script loaded'))
        }
      }, 100)
    }
    script.onerror = () => reject(new Error('Failed to load Paystack inline JS'))
    document.head.appendChild(script)
  })
}

// ── Helper: refresh coin balance from backend ──────────────────────────────────

async function refreshCoinBalance(userId: string): Promise<{ coins_balance: number; coins_reserved: number; coins_lifetime: number } | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/coins/${encodeURIComponent(userId)}`)
    if (res.ok) {
      const data = await res.json()
      return data.balance
    }
  } catch (e) {
    console.error('[DASHBOARD] Failed to refresh balance:', e)
  }
  return null
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function DashboardShell() {
  const {
    view, setView,
    coinBalance, setCoinBalance, tier,
    collections, setCollections,
    selectedEngine, setSelectedEngine,
    searchQuery, setSearchQuery,
    taskStatus, setTaskStatus,
    currentTaskId, setCurrentTaskId,
    leads, setLeads,
    selectedCollectionId, setSelectedCollectionId,
  } = useAppStore()

  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()

  // ── Handle search submission ──────────────────────────────────────────────

  const handleSearch = useCallback(async () => {
    if (!isSignedIn || !userId || !searchQuery.trim()) return

    // Calculate coins to reserve based on tier
    const coinsPerLead = tier === 'pro' ? 3 : tier === 'starter' || tier === 'growth' ? 2 : 1
    const coinsReserved = Math.min(coinsPerLead * 25, coinBalance.coins_balance)

    if (coinsReserved <= 0) {
      setView('dashboard-coin-vault')
      return
    }

    setTaskStatus('pending')
    setView('dashboard-searching')

    try {
      // Step 1: Create task on backend
      const result = await createTask(userId, selectedEngine, searchQuery.trim(), coinsReserved)

      if (!result.success || !result.task) {
        throw new Error('Task creation failed')
      }

      // Extract task ID — backend returns an array from Supabase insert
      const taskData = result.task as any
      const taskId = taskData.id || (Array.isArray(taskData) ? taskData[0]?.id : null)
      if (!taskId) {
        throw new Error('No task ID returned')
      }
      setCurrentTaskId(taskId)
      setTaskStatus('processing')

      // Step 2: Poll until done
      const completedTask = await pollTaskUntilDone(userId, taskId)

      if (!completedTask) {
        setTaskStatus('failed')
        setView('dashboard-results')
        return
      }

      setTaskStatus(completedTask.status as any)

      // Step 3: Refresh balance (coins were deducted by the worker)
      const newBalance = await refreshCoinBalance(userId)
      if (newBalance) {
        setCoinBalance(newBalance)
      }

      // Step 4: Refresh collections using the proper collections endpoint
      try {
        const collectionsData = await getUserCollections(userId)
        if (collectionsData.collections && collectionsData.collections.length > 0) {
          const updatedCollections: Collection[] = collectionsData.collections.map((c: any) => ({
            id: c.id,
            name: c.name || 'Untitled Search',
            task_type: c.task_type as EngineType,
            lead_count: c.lead_count || 0,
            created_at: c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          }))
          setCollections(updatedCollections)

          // Select the most recent collection
          if (updatedCollections.length > 0) {
            setSelectedCollectionId(updatedCollections[0].id)
          }
        }
      } catch (colErr) {
        console.error('[DASHBOARD] Error loading collections:', colErr)
        // Fallback: use task ID to load leads (backend supports it now)
        setSelectedCollectionId(taskId)
      }

      setView('dashboard-results')
    } catch (error: any) {
      console.error('[DASHBOARD] Search error:', error)
      setTaskStatus('failed')
      setView('dashboard-results')
    }
  }, [isSignedIn, userId, searchQuery, selectedEngine, tier, coinBalance])

  // ── Load leads when a collection is selected ─────────────────────────────

  useEffect(() => {
    if (!selectedCollectionId) return

    async function loadLeads() {
      try {
        const data = await getCollectionLeads(selectedCollectionId)
        const mappedLeads: Lead[] = (data.leads || [])
          .map((l: any) => {
            const cache = l.global_intelligence_cache
            if (!cache) return null
            return {
              domain_hash: cache.domain_hash || l.lead_hash,
              company_name: cache.company_name || 'ABSENT',
              website_url: cache.website_url || 'ABSENT',
              dm_name: cache.dm_name || 'ABSENT',
              dm_position: cache.dm_position || 'ABSENT',
              verified_email: cache.verified_email || 'ABSENT',
              is_catchall: cache.is_catchall || false,
              linkedin: cache.linkedin || 'ABSENT',
              instagram: cache.instagram || 'ABSENT',
              phone: cache.phone || 'ABSENT',
              ad_platform: cache.ad_platform,
              address: cache.address,
              aggregator_source: cache.aggregator_source,
              aggregator_url: cache.aggregator_url,
              platform: cache.platform,
              intent_text: cache.intent_text,
            }
          })
          .filter(Boolean) as Lead[]

        setLeads(mappedLeads)
      } catch (error) {
        console.error('[DASHBOARD] Load leads error:', error)
        setLeads([])
      }
    }

    loadLeads()
  }, [selectedCollectionId, setLeads])

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileSidebarToggle />
            <h1 className="font-semibold text-slate text-sm sm:text-base truncate">
              {view === 'dashboard-idle' && 'Dashboard'}
              {view === 'dashboard-searching' && 'Searching...'}
              {view === 'dashboard-results' && 'Search Results'}
              {view === 'dashboard-coin-vault' && 'Coin Vault'}
              {view === 'dashboard-support' && 'Support'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('dashboard-coin-vault')}
              className="flex items-center gap-2 px-3 py-1.5 bg-royal-light text-royal rounded-lg text-sm font-medium hover:bg-royal-light/80 transition"
            >
              <span className="text-xs">🪙</span>
              <span>{coinBalance.coins_balance} coins</span>
            </button>
            <div className="hidden sm:block text-xs text-slate/40 px-2 py-1 bg-ghost rounded capitalize">{tier} tier</div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {view === 'dashboard-idle' && <SearchPanel onSearch={handleSearch} />}
          {view === 'dashboard-searching' && <SearchingState />}
          {view === 'dashboard-results' && <ResultsPanel />}
          {view === 'dashboard-coin-vault' && <CoinVault />}
          {view === 'dashboard-support' && <SupportPanel />}
        </main>
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar() {
  const { view, setView, collections, selectedCollectionId, setSelectedCollectionId } = useAppStore()

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-border flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-royal flex items-center justify-center">
            <span className="text-white font-bold text-sm">BD</span>
          </div>
          <span className="font-bold text-slate">Bad Decision AI</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        <SidebarButton active={view === 'dashboard-idle'} onClick={() => setView('dashboard-idle')} icon="🔍" label="New Search" />
        <SidebarButton active={view === 'dashboard-coin-vault'} onClick={() => setView('dashboard-coin-vault')} icon="🪙" label="Coin Vault" />
        <SidebarButton active={view === 'dashboard-support'} onClick={() => setView('dashboard-support')} icon="💬" label="Support" />

        {/* Collections */}
        {collections.length > 0 && (
          <div className="pt-4">
            <div className="px-3 text-xs font-medium text-slate/40 uppercase tracking-wider mb-2">Past Searches</div>
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedCollectionId(c.id); setView('dashboard-results') }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  selectedCollectionId === c.id ? 'bg-royal-light text-royal' : 'text-slate/60 hover:bg-ghost'
                }`}
              >
                <div className="truncate">{c.name}</div>
                <div className="text-xs text-slate/40 mt-0.5">{c.task_type} · {c.lead_count} leads · {c.created_at}</div>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom links */}
      <div className="p-3 border-t border-border space-y-1">
        <SidebarButton active={view === 'pricing'} onClick={() => setView('pricing')} icon="💰" label="Pricing" />
        <SidebarButton active={view === 'faq'} onClick={() => setView('faq')} icon="❓" label="FAQ" />
        <SidebarButton active={false} onClick={() => setView('landing')} icon="🏠" label="Home" />
      </div>
    </aside>
  )
}

function SidebarButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
        active ? 'bg-royal-light text-royal' : 'text-slate/60 hover:bg-ghost'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}

function MobileSidebarToggle() {
  const [open, setOpen] = useState(false)
  const { view, setView, collections, selectedCollectionId, setSelectedCollectionId, coinBalance, tier } = useAppStore()

  return (
    <div className="md:hidden relative">
      <button onClick={() => setOpen(!open)} className="p-1 text-slate/60">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-12 left-0 w-64 bg-white border border-border rounded-lg shadow-xl z-50 py-2">
            <div className="px-4 py-2 border-b border-border flex items-center gap-2 text-sm">
              <span className="text-royal font-medium">🪙 {coinBalance.coins_balance}</span>
              <span className="text-slate/40 text-xs capitalize">{tier}</span>
            </div>
            <button onClick={() => { setView('dashboard-idle'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">🔍 New Search</button>
            <button onClick={() => { setView('dashboard-coin-vault'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">🪙 Coin Vault</button>
            <button onClick={() => { setView('dashboard-support'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">💬 Support</button>
            <div className="border-t border-border mt-1 pt-1">
              <button onClick={() => { setView('pricing'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">💰 Pricing</button>
              <button onClick={() => { setView('faq'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">❓ FAQ</button>
              <button onClick={() => { setView('landing'); setOpen(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-ghost">🏠 Home</button>
            </div>
            {collections.length > 0 && (
              <div className="border-t border-border mt-1 pt-1">
                <div className="px-4 py-1 text-xs text-slate/40 uppercase">Past Searches</div>
                {collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCollectionId(c.id); setView('dashboard-results'); setOpen(false) }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate/60 hover:bg-ghost truncate"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Search Panel ───────────────────────────────────────────────────────────────

function SearchPanel({ onSearch }: { onSearch: () => void }) {
  const { selectedEngine, setSelectedEngine, searchQuery, setSearchQuery, coinBalance, tier } = useAppStore()

  const coinsPerLead = tier === 'pro' ? 3 : tier === 'starter' || tier === 'growth' ? 2 : 1

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate mb-2">Find Your Next Lead</h2>
        <p className="text-slate/60 text-sm">Choose a search type and describe what you are looking for.</p>
      </div>

      {/* Engine selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {ENGINES.map((engine) => (
          <button
            key={engine.type}
            onClick={() => setSelectedEngine(engine.type)}
            className={`p-4 rounded-xl border text-left transition ${
              selectedEngine === engine.type
                ? 'border-royal bg-royal-light'
                : 'border-border hover:border-royal/30'
            }`}
          >
            <div className="text-2xl mb-1">{engine.icon}</div>
            <div className={`font-medium text-sm ${selectedEngine === engine.type ? 'text-royal' : 'text-slate'}`}>
              {engine.label}
            </div>
            <div className="text-xs text-slate/40 mt-0.5">{engine.desc}</div>
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="bg-white rounded-xl border border-border p-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder={selectedEngine === 'ads_intent' ? 'e.g., roofers in Texas' : selectedEngine === 'smb_maps' ? 'e.g., bakeries in Lagos' : selectedEngine === 'web_absent' ? 'e.g., plumbers on Yelp' : 'e.g., need a web developer'}
          className="w-full px-4 py-3 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none text-sm"
        />
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-slate/40">
            {coinsPerLead} coin/lead · {tier} tier · {coinBalance.coins_balance} coins available
          </div>
          <button
            onClick={onSearch}
            disabled={!searchQuery.trim() || coinBalance.coins_balance <= 0}
            className="px-6 py-2.5 bg-royal text-white rounded-lg font-medium text-sm hover:bg-royal-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {coinBalance.coins_balance <= 0 ? 'No Coins' : 'Search'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Searching State ────────────────────────────────────────────────────────────

function SearchingState() {
  const { searchQuery, selectedEngine, taskStatus } = useAppStore()

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="w-16 h-16 rounded-full bg-royal-light flex items-center justify-center mx-auto mb-6">
        <div className="w-8 h-8 border-2 border-royal border-t-transparent rounded-full animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-slate mb-2">
        {taskStatus === 'pending' ? 'Queuing search...' : 'Processing your search...'}
      </h2>
      <p className="text-slate/60 text-sm">
        Searching for &ldquo;{searchQuery}&rdquo; using {ENGINES.find((e) => e.type === selectedEngine)?.label}
      </p>
      <p className="text-slate/40 text-xs mt-4">
        This may take 30-90 seconds. The backend is finding and verifying leads for you.
      </p>
    </div>
  )
}

// ── Results Panel ──────────────────────────────────────────────────────────────

function ResultsPanel() {
  const { leads, taskStatus, searchQuery, setView, currentTaskId } = useAppStore()

  if (taskStatus === 'failed') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate mb-2">Search Failed</h2>
        <p className="text-slate/60 text-sm mb-6">Something went wrong while processing your search. Your coins were not deducted. Please try again.</p>
        <button onClick={() => setView('dashboard-idle')} className="px-6 py-2.5 bg-royal text-white rounded-lg font-medium text-sm hover:bg-royal-hover transition">
          New Search
        </button>
      </div>
    )
  }

  if (taskStatus === 'exhausted') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-slate mb-2">No Leads Found</h2>
        <p className="text-slate/60 text-sm mb-2">Your search for &ldquo;{searchQuery}&rdquo; returned zero results.</p>
        <p className="text-success text-sm font-medium mb-6">No coins were deducted (empty searches are free).</p>
        <button onClick={() => setView('dashboard-idle')} className="px-6 py-2.5 bg-royal text-white rounded-lg font-medium text-sm hover:bg-royal-hover transition">
          Try a Different Search
        </button>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-4xl mb-4">📭</div>
        <h2 className="text-xl font-bold text-slate mb-2">No Leads in This Collection</h2>
        <p className="text-slate/60 text-sm mb-6">Select a different collection or start a new search.</p>
        <button onClick={() => setView('dashboard-idle')} className="px-6 py-2.5 bg-royal text-white rounded-lg font-medium text-sm hover:bg-royal-hover transition">
          New Search
        </button>
      </div>
    )
  }

  // Count how many leads have actual contact data
  const leadsWithContact = leads.filter((l) =>
    l.verified_email !== 'ABSENT' || l.phone !== 'ABSENT' || l.dm_name !== 'ABSENT' || l.linkedin !== 'ABSENT'
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate">{leads.length} Leads Found</h2>
          {leadsWithContact.length < leads.length && (
            <p className="text-xs text-slate/40 mt-1">
              {leadsWithContact.length} with contact info · {leads.length - leadsWithContact.length} with basic data only
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('dashboard-idle')}
            className="px-4 py-2 border border-border rounded-lg text-sm text-slate/60 hover:bg-ghost transition"
          >
            New Search
          </button>
          <button
            onClick={() => {
              const headers = ['Company', 'Website', 'DM Name', 'Position', 'Email', 'Phone', 'LinkedIn']
              const rows = leads.map((l) => [l.company_name, l.website_url, l.dm_name, l.dm_position, l.verified_email, l.phone, l.linkedin])
              const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'bad-decision-leads.csv'
              a.click()
            }}
            className="px-4 py-2 bg-royal text-white rounded-lg text-sm font-medium hover:bg-royal-hover transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-ghost/50">
                <th className="text-left px-4 py-3 font-medium text-slate/40">Company</th>
                <th className="text-left px-4 py-3 font-medium text-slate/40">DM Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate/40">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate/40">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-slate/40">Validation</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-ghost/30 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate">{lead.company_name}</div>
                    {lead.website_url !== 'ABSENT' && (
                      <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-royal hover:underline">
                        {lead.website_url}
                      </a>
                    )}
                    {lead.address && lead.address !== 'ABSENT' && (
                      <div className="text-xs text-slate/40 mt-0.5">{lead.address}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate">{lead.dm_name}</div>
                    {lead.dm_position !== 'ABSENT' && (
                      <div className="text-xs text-slate/40">{lead.dm_position}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {lead.verified_email !== 'ABSENT' ? (
                      <div className="flex items-center gap-1">
                        <span className="text-slate">{lead.verified_email}</span>
                        {lead.is_catchall && (
                          <span className="text-xs px-1.5 py-0.5 bg-warn-bg text-warn-text rounded">Catch-all</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-absent-bg text-absent-text rounded">ABSENT</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {lead.phone !== 'ABSENT' ? (
                      <span className="text-slate">{lead.phone}</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-absent-bg text-absent-text rounded">ABSENT</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ValidationBadge email={lead.verified_email} isCatchall={lead.is_catchall} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ValidationBadge({ email, isCatchall }: { email: string; isCatchall: boolean }) {
  if (email === 'ABSENT') {
    return <span className="text-xs px-2 py-1 bg-ghost text-slate/40 rounded">DNS only</span>
  }
  if (isCatchall) {
    return <span className="text-xs px-2 py-1 bg-warn-bg text-warn-text rounded">SMTP (catch-all)</span>
  }
  return <span className="text-xs px-2 py-1 bg-success-bg text-success rounded">Verified</span>
}

// ── Coin Vault ─────────────────────────────────────────────────────────────────

function CoinVault() {
  const { coinBalance, setCoinBalance, tier, userCountry, setView } = useAppStore()
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const [loading, setLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const isNGN = userCountry === 'NG' || userCountry === 'GH'

  const packages = [
    { id: 'pkg-500', coins: 500, priceNGN: 4000, priceUSD: 5 },
    { id: 'pkg-1500', coins: 1500, priceNGN: 12000, priceUSD: 15 },
    { id: 'pkg-3000', coins: 3000, priceNGN: 20000, priceUSD: 25 },
    { id: 'pkg-5000', coins: 5000, priceNGN: 28000, priceUSD: 35 },
  ]

  async function handlePaystackCheckout(pkg: typeof packages[number]) {
    if (!isSignedIn || !userId) {
      setView('signin')
      return
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!paystackKey) {
      setMsg({ type: 'error', text: 'Payment system not configured. Please contact support.' })
      return
    }

    setLoading(pkg.id)
    setMsg(null)

    try {
      const PaystackPop = await getPaystackPOP()
      const amount = isNGN ? pkg.priceNGN : pkg.priceUSD

      PaystackPop.setup({
        key: paystackKey,
        email: user?.primaryEmailAddress?.emailAddress || '',
        amount: amount * 100,
        currency: isNGN ? 'NGN' : 'USD',
        metadata: {
          coins: pkg.coins,
          user_id: userId,
          type: 'coin_purchase',
        },
        onClose: () => {
          setLoading(null)
        },
        callback: async (response: { reference: string }) => {
          console.log('[PAYSTACK] Payment successful:', response.reference)

          try {
            await addCoins(userId, pkg.coins)
          } catch (e) {
            console.error('[PAYSTACK] Manual coin add error:', e)
          }

          // Refresh balance from backend
          const newBalance = await refreshCoinBalance(userId)
          if (newBalance) {
            setCoinBalance(newBalance)
          }

          setMsg({ type: 'success', text: `Payment successful! ${pkg.coins} coins added to your balance.` })
          setLoading(null)
        },
      })
    } catch (error: any) {
      console.error('[PAYSTACK] Checkout error:', error)
      setMsg({ type: 'error', text: error.message || 'Payment failed to initialize. Please try again.' })
      setLoading(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Message */}
      {msg && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
          msg.type === 'success' ? 'bg-success-bg text-success' : 'bg-absent-bg text-absent-text'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Balance card */}
      <div className="bg-gradient-to-br from-midnight to-slate text-white rounded-xl p-6 mb-8">
        <div className="text-sm text-white/60 mb-1">Your Balance</div>
        <div className="text-4xl font-bold mb-4">{coinBalance.coins_balance.toLocaleString()} coins</div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-white/40">Available</div>
            <div className="font-medium">{coinBalance.coins_balance.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-white/40">Reserved</div>
            <div className="font-medium">{coinBalance.coins_reserved.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-white/40">Lifetime</div>
            <div className="font-medium">{coinBalance.coins_lifetime.toLocaleString()}</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/40">
          Current plan: <span className="text-royal font-medium capitalize">{tier}</span> — {
            tier === 'pro' ? '3 coins/lead (Full verification)' : tier === 'starter' || tier === 'growth' ? '2 coins/lead (Enhanced verification)' : '1 coin/lead (Basic verification)'
          }
        </div>
      </div>

      {/* Top up packages */}
      <h3 className="text-lg font-semibold text-slate mb-4">Top Up with Paystack</h3>
      <div className="grid grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => handlePaystackCheckout(pkg)}
            disabled={loading === pkg.id}
            className="bg-white p-5 rounded-xl border border-border hover:border-royal/30 hover:shadow-md transition text-left disabled:opacity-50"
          >
            <div className="text-xl font-bold text-slate">{pkg.coins.toLocaleString()} coins</div>
            <div className="text-royal font-medium mt-1">
              {isNGN ? `₦${pkg.priceNGN.toLocaleString()}` : `$${pkg.priceUSD}`}
            </div>
            {loading === pkg.id && <div className="text-xs text-slate/40 mt-2">Opening Paystack...</div>}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate/40 mt-4 text-center">
        Secure payment powered by Paystack. Your coins are added instantly after payment.
      </p>
    </div>
  )
}

// ── Support Panel ──────────────────────────────────────────────────────────────

function SupportPanel() {
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="text-4xl mb-4">💬</div>
      <h2 className="text-xl font-bold text-slate mb-2">Need Help?</h2>
      <p className="text-slate/60 text-sm mb-6">
        Email us at{' '}
        <a href="mailto:support@baddecision.ai" className="text-royal hover:underline">
          support@baddecision.ai
        </a>
      </p>
    </div>
  )
}
