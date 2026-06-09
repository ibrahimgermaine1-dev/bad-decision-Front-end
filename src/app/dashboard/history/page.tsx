'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Target,
  MapPin,
  Globe,
  MessageSquare,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  Loader2,
} from 'lucide-react'
import { getUserTasks } from '@/lib/backend'
import type { EngineType } from '@/stores/app-store'

type TaskStatus = 'completed' | 'processing' | 'failed'

interface HistoryItem {
  id: string
  query: string
  engine: EngineType
  status: TaskStatus
  leadCount: number
  location: string
  date: string
  coinsUsed: number
}

const engineConfig: Record<EngineType, { name: string; icon: React.ReactNode; color: string }> = {
  ads_intent: { name: 'Ads Intent', icon: <Target className="w-4 h-4" />, color: 'var(--color-orange)' },
  smb_maps: { name: 'SMB Maps', icon: <MapPin className="w-4 h-4" />, color: 'var(--color-blue)' },
  web_absent: { name: 'Web Absent', icon: <Globe className="w-4 h-4" />, color: 'var(--color-red)' },
  social_intent: { name: 'Social Intent', icon: <MessageSquare className="w-4 h-4" />, color: 'var(--color-green)' },
}

export default function HistoryPage() {
  const { userId } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchFilter, setSearchFilter] = useState('')
  const [engineFilter, setEngineFilter] = useState<EngineType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')

  // Fetch real tasks from backend
  useEffect(() => {
    if (!userId) return
    const fetchTasks = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getUserTasks(userId)
        if (data.tasks) {
          const mapped: HistoryItem[] = data.tasks.map((t: any) => ({
            id: t.id,
            query: t.query || 'Untitled Search',
            engine: (t.task_type || 'smb_maps') as EngineType,
            status: mapStatus(t.status),
            leadCount: t.lead_count || 0,
            location: t.location || '—',
            date: t.created_at || new Date().toISOString(),
            coinsUsed: t.coins_reserved || 0,
          }))
          setHistory(mapped)
        }
      } catch (err: any) {
        console.error('[HISTORY] Failed to load tasks:', err)
        setError('Failed to load search history. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [userId])

  const filteredHistory = history.filter(item => {
    if (searchFilter && !item.query.toLowerCase().includes(searchFilter.toLowerCase())) return false
    if (engineFilter !== 'all' && item.engine !== engineFilter) return false
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    return true
  })

  const totalLeads = history.reduce((sum, item) => sum + item.leadCount, 0)
  const totalCoins = history.reduce((sum, item) => sum + item.coinsUsed, 0)

  return (
    <div className="min-h-screen bg-[var(--color-midnight)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back nav */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Search History</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Every search you have run. Every lead you have found. All in one place.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-8 h-8 text-[var(--color-accent)]" />
            </motion.div>
            <span className="ml-3 text-sm text-[var(--color-text-secondary)]">Loading history...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-sm text-[var(--color-red)]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-[var(--color-accent)] hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{history.length}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Total Searches</p>
              </div>
              <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalLeads}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Leads Found</p>
              </div>
              <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
                <p className="text-2xl font-bold text-[var(--color-coin)]">{totalCoins}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Coins Spent</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search your history..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={engineFilter}
                  onChange={(e) => setEngineFilter(e.target.value as EngineType | 'all')}
                  className="px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="all">All Engines</option>
                  <option value="ads_intent">Ads Intent</option>
                  <option value="smb_maps">SMB Maps</option>
                  <option value="web_absent">Web Absent</option>
                  <option value="social_intent">Social Intent</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                  className="px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Done</option>
                  <option value="processing">Working</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* History List */}
            <div className="space-y-3">
              {filteredHistory.map((item, i) => {
                const engine = engineConfig[item.engine] || engineConfig.smb_maps
                const date = new Date(item.date)
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={`/dashboard/results/${item.id}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${engine.color}10`, color: engine.color }}
                        >
                          {engine.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                            {item.query}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[var(--color-text-tertiary)]">{item.location}</span>
                            <span className="text-xs text-[var(--color-text-tertiary)]">|</span>
                            <span className="text-xs text-[var(--color-text-tertiary)]">{dateStr} {timeStr}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.leadCount} leads
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.coinsUsed} coins
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.status === 'completed'
                            ? 'bg-[var(--color-green-bg)] text-[var(--color-green)]'
                            : item.status === 'processing'
                              ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                              : 'bg-[var(--color-red-bg)] text-[var(--color-red)]'
                        }`}>
                          {item.status === 'completed' ? 'Done' : item.status === 'processing' ? 'Working' : 'Failed'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Empty state */}
            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {history.length === 0
                    ? 'No searches yet. Start your first search from the dashboard.'
                    : 'No searches match your filters'}
                </p>
                {history.length === 0 && (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline mt-2"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================
// STATUS MAPPING HELPER
// ============================================================
function mapStatus(status: string): TaskStatus {
  if (status === 'completed' || status === 'exhausted') return 'completed'
  if (status === 'processing' || status === 'pending') return 'processing'
  return 'failed'
}
