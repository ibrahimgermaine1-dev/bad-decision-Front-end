'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Target,
  MapPin,
  Globe,
  MessageSquare,
  Filter,
  Calendar,
  Clock,
  Download,
  ChevronRight,
  Search,
} from 'lucide-react'

type EngineType = 'ads_intent' | 'smb_maps' | 'web_absent' | 'social_intent'
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

const mockHistory: HistoryItem[] = [
  { id: 'task-1', query: 'Restaurants in Lagos', engine: 'smb_maps', status: 'completed', leadCount: 47, location: 'Lagos, Nigeria', date: '2024-01-15T10:30:00', coinsUsed: 8 },
  { id: 'task-2', query: 'Dentists running Google Ads', engine: 'ads_intent', status: 'completed', leadCount: 23, location: 'New York, USA', date: '2024-01-15T08:15:00', coinsUsed: 10 },
  { id: 'task-3', query: 'Businesses without websites', engine: 'web_absent', status: 'completed', leadCount: 89, location: 'London, UK', date: '2024-01-14T16:45:00', coinsUsed: 12 },
  { id: 'task-4', query: 'People asking for CRM tools', engine: 'social_intent', status: 'processing', leadCount: 0, location: 'Global', date: '2024-01-15T11:00:00', coinsUsed: 15 },
  { id: 'task-5', query: 'Gyms in Abuja', engine: 'smb_maps', status: 'completed', leadCount: 34, location: 'Abuja, Nigeria', date: '2024-01-13T09:20:00', coinsUsed: 8 },
  { id: 'task-6', query: 'E-commerce stores running ads', engine: 'ads_intent', status: 'completed', leadCount: 56, location: 'Lagos, Nigeria', date: '2024-01-12T14:10:00', coinsUsed: 10 },
  { id: 'task-7', query: 'No website plumbers', engine: 'web_absent', status: 'failed', leadCount: 0, location: 'California, USA', date: '2024-01-12T11:30:00', coinsUsed: 0 },
  { id: 'task-8', query: 'Marketing agency discussions', engine: 'social_intent', status: 'completed', leadCount: 18, location: 'Global', date: '2024-01-11T08:45:00', coinsUsed: 15 },
  { id: 'task-9', query: 'Hotels in Nairobi', engine: 'smb_maps', status: 'completed', leadCount: 62, location: 'Nairobi, Kenya', date: '2024-01-10T13:20:00', coinsUsed: 8 },
  { id: 'task-10', query: 'SaaS companies on Ads', engine: 'ads_intent', status: 'completed', leadCount: 41, location: 'Global', date: '2024-01-09T10:00:00', coinsUsed: 10 },
]

export default function HistoryPage() {
  const [searchFilter, setSearchFilter] = useState('')
  const [engineFilter, setEngineFilter] = useState<EngineType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')

  const filteredHistory = mockHistory.filter(item => {
    if (searchFilter && !item.query.toLowerCase().includes(searchFilter.toLowerCase())) return false
    if (engineFilter !== 'all' && item.engine !== engineFilter) return false
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    return true
  })

  const totalLeads = mockHistory.reduce((sum, item) => sum + item.leadCount, 0)
  const totalCoins = mockHistory.reduce((sum, item) => sum + item.coinsUsed, 0)

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

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{mockHistory.length}</p>
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
            const engine = engineConfig[item.engine]
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
            <p className="text-sm text-[var(--color-text-secondary)]">No searches match your filters</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Try different search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
