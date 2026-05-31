'use client'

/**
 * DASHBOARD — The Matrix Shell
 * Persistent split-pane workspace.
 * Left sidebar: Smart Collections + profile.
 * Main canvas: Idle Hub, Command HUD, Results, Coin Vault, Support.
 * No emojis. Premium design. Click-driven.
 */
import { useState, useCallback } from 'react'
import { useAppStore, type AppView, type EngineType, type Lead } from '@/stores/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { exportLeadsToCsv, downloadCsv } from '@/lib/csv-shield'

// ============================================================
// ENGINE CONFIG (no tech jargon)
// ============================================================
const ENGINE_CARDS = [
  {
    id: 'ads_intent' as EngineType,
    title: 'Companies Running Ads',
    desc: 'Find businesses with marketing budgets.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    id: 'smb_maps' as EngineType,
    title: 'Local Businesses',
    desc: 'Find local shops, agencies, and clinics.',
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
    desc: 'Find businesses that need a website built.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    id: 'social_intent' as EngineType,
    title: 'People Asking For Help',
    desc: 'Find people who want to buy right now.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

// Demo leads for results view
const DEMO_LEADS: Lead[] = [
  { domain_hash: 'abc123', company_name: 'Peak Roofing Co', website_url: 'peakroofing.com', dm_name: 'Marcus Johnson', dm_position: 'Owner', verified_email: 'marcus@peakroofing.com', is_catchall: false, linkedin: 'ABSENT', instagram: 'ABSENT', phone: '+12345678901', ad_platform: 'Meta Ads' },
  { domain_hash: 'def456', company_name: 'Summit Plumbing LLC', website_url: 'summitplumbing.com', dm_name: 'Sarah Chen', dm_position: 'CEO', verified_email: 'sarah@summitplumbing.com', is_catchall: false, linkedin: 'linkedin.com/in/sarahchen', instagram: 'ABSENT', phone: 'ABSENT', ad_platform: 'Google Ads' },
  { domain_hash: 'ghi789', company_name: 'AllState Exteriors', website_url: 'allstateext.com', dm_name: 'ABSENT', dm_position: 'ABSENT', verified_email: 'info@allstateext.com', is_catchall: true, linkedin: 'ABSENT', instagram: 'ABSENT', phone: '+18005551234', ad_platform: 'Meta Ads' },
  { domain_hash: 'jkl012', company_name: 'Lone Star HVAC', website_url: 'lonestarhvac.com', dm_name: 'David Park', dm_position: 'Founder', verified_email: 'david@lonestarhvac.com', is_catchall: false, linkedin: 'ABSENT', instagram: 'instagram.com/lonestarhvac', phone: '+12145559876', ad_platform: 'Google Ads' },
  { domain_hash: 'mno345', company_name: 'QuickFix Electric', website_url: 'ABSENT', dm_name: 'ABSENT', dm_position: 'ABSENT', verified_email: 'ABSENT', is_catchall: false, linkedin: 'ABSENT', instagram: 'ABSENT', phone: 'ABSENT', aggregator_source: 'Yelp', aggregator_url: 'yelp.com/biz/quickfix' },
]

// ============================================================
// MAIN SHELL
// ============================================================
export function DashboardShell() {
  const {
    view, setView,
    tier, coinBalance,
    selectedEngine, setSelectedEngine,
    searchQuery, setSearchQuery,
    taskStatus, setTaskStatus,
    leads, setLeads,
    collections,
    selectedLead, setSelectedLead,
    inspectorOpen, setInspectorOpen,
    setAuthenticated,
  } = useAppStore()

  const isNigeria = useAppStore((s) => s.userCountry) === 'NG'

  // Determine active sub-view
  const activeSubView: 'idle' | 'searching' | 'results' | 'coin-vault' | 'support' =
    view === 'dashboard-coin-vault' ? 'coin-vault' :
    view === 'dashboard-support' ? 'support' :
    view === 'dashboard-results' ? 'results' :
    view === 'dashboard-searching' ? 'searching' : 'idle'

  // ============================================================
  // SEARCH HANDLER
  // ============================================================
  const handleSearch = useCallback(() => {
    if (!selectedEngine || !searchQuery.trim()) return
    setView('dashboard-searching')
    setTaskStatus('processing')

    // Simulate search (in production: call backend API)
    setTimeout(() => {
      setLeads(DEMO_LEADS)
      setTaskStatus('completed')
      setView('dashboard-results')
    }, 4000)
  }, [selectedEngine, searchQuery, setView, setTaskStatus, setLeads])

  // ============================================================
  // EXPORT HANDLER
  // ============================================================
  const handleExport = () => {
    const csv = exportLeadsToCsv(leads.length > 0 ? leads : DEMO_LEADS, selectedEngine || undefined)
    downloadCsv(csv, `bad-decision-leads-${Date.now()}.csv`)
  }

  return (
    <div className="h-screen flex bg-white">
      {/* ============================================================ */}
      {/* LEFT SIDEBAR */}
      {/* ============================================================ */}
      <aside className="w-64 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center gap-2 border-b border-[#E2E8F0]">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BD</span>
          </div>
          <span className="font-semibold text-[#0F172A] text-sm">Bad Decision AI</span>
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
            {collections.map((col) => (
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
            ))}
          </div>
        </div>

        {/* Bottom: Navigation + Profile */}
        <div className="border-t border-[#E2E8F0] p-4 space-y-1">
          <button
            onClick={() => setView('dashboard-coin-vault')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeSubView === 'coin-vault' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'text-[#0F172A] hover:bg-white'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Coin Vault
          </button>
          <button
            onClick={() => setView('dashboard-support')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeSubView === 'support' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'text-[#0F172A] hover:bg-white'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Support
          </button>
          <button
            onClick={() => { setAuthenticated(false); setView('landing') }}
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
        <div className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 flex-shrink-0">
          <button onClick={() => setView('dashboard-idle')} className="flex items-center gap-2 text-[#0F172A]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <Badge tier={tier} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={leads.length === 0 && activeSubView !== 'results'}
              className="border-[#E2E8F0] text-[#0F172A] disabled:text-[#94A3B8] disabled:border-[#F1F5F9]"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Canvas Content */}
        <div className="flex-1 overflow-y-auto">
          {activeSubView === 'idle' && (
            <IdleWorkspace
              onSelectEngine={(engine) => {
                setSelectedEngine(engine)
              }}
              selectedEngine={selectedEngine}
              onSearch={handleSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {activeSubView === 'searching' && (
            <SearchingView engine={selectedEngine} query={searchQuery} />
          )}
          {activeSubView === 'results' && (
            <ResultsMatrix
              leads={leads.length > 0 ? leads : DEMO_LEADS}
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

      {/* ============================================================ */}
      {/* CANVAS INSPECTOR (Slide-out Drawer) */}
      {/* ============================================================ */}
      {inspectorOpen && selectedLead && (
        <aside className="w-[30%] min-w-[360px] bg-[#F8FAFC] border-l border-[#E2E8F0] flex flex-col overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0F172A]">Contact Details</h2>
              <button onClick={() => setInspectorOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center">
                <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <DataField label="Company" value={selectedLead.company_name} />
              <DataField label="Website" value={selectedLead.website_url} isLink />
              <DataField label="Decision Maker" value={selectedLead.dm_name} />
              <DataField label="Position" value={selectedLead.dm_position} />
              <DataField label="Verified Email" value={selectedLead.verified_email} />
              <DataField label="Phone" value={selectedLead.phone} />
              <DataField label="LinkedIn" value={selectedLead.linkedin} isLink />
              <DataField label="Instagram" value={selectedLead.instagram} isLink />

              {/* Verification Badges */}
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
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        {!showTerminal ? (
          <>
            <h1 className="text-2xl font-bold text-[#0F172A] text-center">What Are You Looking For?</h1>
            <p className="text-[#64748B] text-center mt-2 mb-10">Select a target type to begin your search.</p>
            <div className="grid grid-cols-2 gap-4">
              {ENGINE_CARDS.map((engine) => (
                <button
                  key={engine.id}
                  onClick={() => {
                    onSelectEngine(engine.id)
                    setShowTerminal(true)
                  }}
                  className="group rounded-2xl border-2 border-[#E2E8F0] bg-white p-8 text-left hover:border-[#2563EB] transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] group-hover:bg-[#DBEAFE] flex items-center justify-center mb-4 text-[#64748B] group-hover:text-[#2563EB] transition-colors">
                    {engine.icon}
                  </div>
                  <h3 className="font-semibold text-[#0F172A]">{engine.title}</h3>
                  <p className="text-sm text-[#64748B] mt-1">{engine.desc}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Search Terminal */
          <div className="rounded-2xl border-2 border-[#2563EB] bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
                  {ENGINE_CARDS.find(e => e.id === selectedEngine)?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A]">
                    {ENGINE_CARDS.find(e => e.id === selectedEngine)?.title}
                  </h3>
                  <p className="text-xs text-[#64748B]">Type your search query below</p>
                </div>
              </div>
              <button onClick={() => setShowTerminal(false)} className="w-8 h-8 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="flex-1 h-12 border-[#E2E8F0] text-base"
                autoFocus
              />
              <Button onClick={onSearch} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 h-12 font-semibold">
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
function SearchingView({ engine, query }: { engine: EngineType | null; query: string }) {
  return (
    <div className="h-full flex flex-col">
      {/* Ghost Row Table */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
            <table className="w-full">
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

      {/* Telemetry Ticker */}
      <div className="bg-[#0B1120] px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <span className="text-[#2563EB] font-mono text-sm font-semibold">[ WORKING ]</span>
        <span className="text-[#94A3B8] font-mono text-sm">
          RUNNING LIVE INBOX TEST ON 25 TARGETS...
        </span>
        <span className="cursor-blink text-[#2563EB] font-mono">_</span>
      </div>
    </div>
  )
}

// ============================================================
// RESULTS MATRIX — High-Density Data Table
// ============================================================
function ResultsMatrix({ leads, onSelectLead }: { leads: Lead[]; onSelectLead: (l: Lead) => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">Results</h2>
              <p className="text-sm text-[#64748B]">{leads.length} verified contacts found</p>
            </div>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
            <table className="w-full">
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
      </div>
    </div>
  )
}

// ============================================================
// COIN VAULT — Billing Page
// ============================================================
function CoinVault() {
  const { coinBalance, addCoins, userCountry } = useAppStore()
  const isNigeria = userCountry === 'NG'

  const packs = [
    { coins: 500, usd: 5, ngn: 4000 },
    { coins: 1500, usd: 15, ngn: 12000 },
    { coins: 5000, usd: 35, ngn: 28000 },
  ]

  const maxCoins = Math.max(coinBalance.coins_lifetime, 5000)
  const progress = Math.min((coinBalance.coins_balance / maxCoins) * 100, 100)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0F172A]">Coin Vault</h1>
      <p className="text-[#64748B] mt-1">Manage your coin balance and purchase top-ups.</p>

      {/* Progress Bar */}
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

      {/* Top-Up Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {packs.map((pack) => (
          <div key={pack.coins} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center">
            <p className="text-3xl font-bold text-[#0F172A]">{pack.coins.toLocaleString()}</p>
            <p className="text-sm text-[#64748B] mt-1">coins</p>
            <p className="text-xl font-semibold text-[#0F172A] mt-3">
              {isNigeria ? `N${pack.ngn.toLocaleString()}` : `$${pack.usd}`}
            </p>
            <Button
              onClick={() => addCoins(pack.coins)}
              className="mt-4 w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold"
            >
              Buy with Paystack
            </Button>
          </div>
        ))}
      </div>

      {/* Receipt History */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Receipt History</h2>
        <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
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
                <td className="px-4 py-3 text-sm text-[#0F172A]">2026-05-30</td>
                <td className="px-4 py-3 text-sm text-[#64748B]">Free trial credits</td>
                <td className="px-4 py-3 text-sm font-medium text-[#16A34A]">+50</td>
                <td className="px-4 py-3"><span className="inline-block rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-medium px-2.5 py-0.5">Complete</span></td>
              </tr>
            </tbody>
          </table>
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0F172A]">Support Terminal</h1>
      <p className="text-[#64748B] mt-1">Get help or submit a ticket.</p>

      {/* Ticket History */}
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

      {/* New Ticket */}
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
            <Button onClick={() => setSubmitted(true)} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold">
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
