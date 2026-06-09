'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  Target,
  MapPin,
  MessageSquare,
  Shield,
  Copy,
} from 'lucide-react'
import type { Lead } from '@/lib/api'

type EngineType = 'ads_intent' | 'smb_maps' | 'web_absent' | 'social_intent'

interface LeadTableProps {
  leads: Lead[]
  engine?: EngineType
  isLoading?: boolean
}

const engineIcons: Record<EngineType, React.ReactNode> = {
  ads_intent: <Target className="w-3.5 h-3.5" />,
  smb_maps: <MapPin className="w-3.5 h-3.5" />,
  web_absent: <Globe className="w-3.5 h-3.5" />,
  social_intent: <MessageSquare className="w-3.5 h-3.5" />,
}

const engineColors: Record<EngineType, string> = {
  ads_intent: 'var(--color-orange)',
  smb_maps: 'var(--color-blue)',
  web_absent: 'var(--color-red)',
  social_intent: 'var(--color-green)',
}

type SortField = 'name' | 'email' | 'verified' | 'engine'
type SortDir = 'asc' | 'desc'

export function LeadTable({ leads, engine, isLoading }: LeadTableProps) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [filter, setFilter] = useState<string>('')
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filteredLeads = leads
    .filter(lead => !filter || lead.name.toLowerCase().includes(filter.toLowerCase()) || lead.email?.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField] || ''
      const bVal = b[sortField] || ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })

  const toggleSelect = (id: string) => {
    const next = new Set(selectedLeads)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedLeads(next)
  }

  const toggleAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)))
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-[var(--color-deep-blue)] shimmer" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {leads.length} leads found
          </h3>
          {selectedLeads.size > 0 && (
            <span className="text-xs text-[var(--color-accent)]">
              ({selectedLeads.size} selected)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter leads..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-[var(--color-deep-blue)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium hover:bg-[var(--color-accent)]/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                  onChange={toggleAll}
                  className="rounded border-[var(--color-border)] bg-[var(--color-deep-blue)] accent-[var(--color-accent)]"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button type="button" onClick={() => toggleSort('name')} className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider hover:text-[var(--color-text-secondary)]">
                  Business {renderSortIcon('name')}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button type="button" onClick={() => toggleSort('email')} className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider hover:text-[var(--color-text-secondary)]">
                  Contact {renderSortIcon('email')}
                </button>
              </th>
              <th className="px-4 py-3 text-left hidden md:table-cell">
                <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Website</span>
              </th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">
                <button type="button" onClick={() => toggleSort('verified')} className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider hover:text-[var(--color-text-secondary)]">
                  Verified {renderSortIcon('verified')}
                </button>
              </th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">
                <button type="button" onClick={() => toggleSort('engine')} className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider hover:text-[var(--color-text-secondary)]">
                  Engine {renderSortIcon('engine')}
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredLeads.map((lead, i) => {
                const leadEngine = (lead.engine || engine || 'ads_intent') as EngineType
                return (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`
                      border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-hover)] transition-colors
                      ${selectedLeads.has(lead.id) ? 'bg-[var(--color-accent)]/5' : ''}
                    `}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="rounded border-[var(--color-border)] bg-[var(--color-deep-blue)] accent-[var(--color-accent)]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{lead.name}</p>
                        {lead.category && (
                          <p className="text-xs text-[var(--color-text-tertiary)]">{lead.category}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[180px]">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {!lead.email && !lead.phone && (
                          <span className="text-xs text-[var(--color-text-tertiary)]">No contact</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{lead.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--color-red)] bg-[var(--color-red-bg)] px-2 py-0.5 rounded-full">
                          <Globe className="w-3 h-3" /> No website
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {lead.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--color-green)]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                          <XCircle className="w-3.5 h-3.5" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color: engineColors[leadEngine],
                          background: `${engineColors[leadEngine]}10`,
                        }}
                      >
                        {engineIcons[leadEngine]}
                        {leadEngine.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {lead.email && (
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(lead.email!)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-light)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                            title="Copy email"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredLeads.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--color-surface-light)] flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-[var(--color-text-tertiary)]" />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">No leads found</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
