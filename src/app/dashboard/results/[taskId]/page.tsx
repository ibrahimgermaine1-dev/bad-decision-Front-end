'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  Share2,
  Target,
  MapPin,
  Globe,
  MessageSquare,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { getCollectionLeads } from '@/lib/backend'
import type { EngineType, Lead } from '@/stores/app-store'

const engineConfig = {
  ads_intent: { name: 'Ads Intent', icon: <Target className="w-4 h-4" />, color: 'var(--color-orange)' },
  smb_maps: { name: 'SMB Maps', icon: <MapPin className="w-4 h-4" />, color: 'var(--color-blue)' },
  web_absent: { name: 'Web Absent', icon: <Globe className="w-4 h-4" />, color: 'var(--color-red)' },
  social_intent: { name: 'Social Intent', icon: <MessageSquare className="w-4 h-4" />, color: 'var(--color-green)' },
}

type EngineConfigType = keyof typeof engineConfig

export default function ResultsPage() {
  const params = useParams()
  const taskId = params?.taskId as string
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [taskInfo, setTaskInfo] = useState({
    query: 'Loading...',
    engine: 'smb_maps' as EngineConfigType,
    status: 'loading',
    leadCount: 0,
    location: '',
    date: '',
    coinsUsed: 0,
  })

  useEffect(() => {
    if (!taskId) return
    const fetchLeads = async () => {
      try {
        const data = await getCollectionLeads(taskId)
        if (data.leads) {
          setLeads(data.leads)
          setTaskInfo(prev => ({
            ...prev,
            query: data.query || 'Search Results',
            leadCount: data.leads.length,
            status: 'completed',
          }))
        }
      } catch (err) {
        console.error('[RESULTS] Failed to load leads:', err)
        setError('Failed to load results. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchLeads()
  }, [taskId])

  const engine = engineConfig[taskInfo.engine]
  const verifiedCount = leads.filter(l => l.verified_email).length
  const withWebsite = leads.filter(l => l.website_url).length

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back nav */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-8 h-8 text-[var(--color-accent)]" />
            </motion.div>
            <span className="ml-3 text-sm text-[var(--text-secondary)]">Loading results...</span>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-16">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-[var(--color-accent)] hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results Content */}
        {!isLoading && !error && (
          <>
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${engine.color}10`, color: engine.color }}
                    >
                      {engine.icon}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        {taskInfo.query}
                      </h1>
                      {taskInfo.location && (
                        <p className="text-sm text-[var(--text-tertiary)]">
                          {taskInfo.location} · {taskInfo.date}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-accent)]/30 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </motion.button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <ResultStat label="Total Leads" value={taskInfo.leadCount} icon={<CheckCircle2 className="w-4 h-4" />} color="var(--color-accent)" />
                <ResultStat label="Verified" value={verifiedCount} icon={<CheckCircle2 className="w-4 h-4" />} color="var(--color-green)" />
                <ResultStat label="With Website" value={withWebsite} icon={<Globe className="w-4 h-4" />} color="var(--color-blue)" />
                <ResultStat label="Coins Used" value={taskInfo.coinsUsed} icon={<Clock className="w-4 h-4" />} color="var(--color-coin)" />
              </div>
            </motion.div>

            {/* Lead Table */}
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-[var(--text-secondary)]">No leads found for this search.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-secondary)]">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Company</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider hidden md:table-cell">Decision Maker</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider hidden lg:table-cell">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {leads.map((lead, i) => (
                      <tr key={lead.domain_hash || i} className="hover:bg-[var(--bg-surface)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">{lead.company_name || 'Unknown'}</div>
                          <div className="text-xs text-[var(--text-tertiary)] truncate max-w-[200px]">{lead.website_url || 'No website'}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="text-[var(--text-primary)]">{lead.dm_name || '—'}</div>
                          <div className="text-xs text-[var(--text-tertiary)]">{lead.dm_position || ''}</div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-[var(--text-secondary)] text-xs truncate max-w-[180px] block">{lead.verified_email || '—'}</span>
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
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ResultStat({ label, value, icon, color }: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}10`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-[var(--text-primary)]">{value}</p>
        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}
