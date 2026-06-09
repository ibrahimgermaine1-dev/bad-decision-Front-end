'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  LayoutDashboard,
  History,
  CreditCard,
  Target,
  MapPin,
  Globe,
  MessageSquare,
  Coins,
  ArrowRight,
  Clock,
  TrendingUp,
  Search,
} from 'lucide-react'
import { SearchBar, type EngineType } from '@/components/search-bar'
import { StatCard } from '@/components/stat-card'
import { CoinBalance } from '@/components/coin-balance'
import type { Lead } from '@/lib/api'

// Mock data for demonstration
const mockRecentSearches = [
  { id: '1', query: 'Restaurants in Lagos', engine: 'smb_maps' as EngineType, leads: 47, status: 'completed', date: '2 hours ago' },
  { id: '2', query: 'Dentists running ads', engine: 'ads_intent' as EngineType, leads: 23, status: 'completed', date: '5 hours ago' },
  { id: '3', query: 'No website businesses NYC', engine: 'web_absent' as EngineType, leads: 89, status: 'completed', date: '1 day ago' },
  { id: '4', query: 'People asking for CRM tools', engine: 'social_intent' as EngineType, leads: 15, status: 'processing', date: '3 min ago' },
]

const mockLeads: Lead[] = [
  { id: '1', name: 'Sunrise Bakery', email: 'hello@sunrisebakery.com', phone: '+234 801 234 5678', website: 'https://sunrisebakery.com', address: '45 Admiralty Way, Lagos', category: 'Restaurant', engine: 'smb_maps', verified: true },
  { id: '2', name: 'Metro Dental Clinic', email: 'info@metrodental.com', phone: '+234 802 345 6789', website: 'https://metrodental.com', address: '12 Allen Avenue, Lagos', category: 'Healthcare', engine: 'ads_intent', verified: true },
  { id: '3', name: 'Quick Print Solutions', email: 'quickprint@gmail.com', phone: '+234 803 456 7890', website: undefined, address: '78 Awolowo Road, Lagos', category: 'Printing', engine: 'web_absent', verified: false },
  { id: '4', name: 'TechHub Consulting', email: 'contact@techhub.ng', phone: '+234 804 567 8901', website: 'https://techhub.ng', address: '3 Isaac John St, Lagos', category: 'IT Services', engine: 'social_intent', verified: true },
  { id: '5', name: 'Green Valley Farms', email: 'farms@greenvalley.com', phone: undefined, website: undefined, address: 'Ibadan Expressway', category: 'Agriculture', engine: 'web_absent', verified: false },
  { id: '6', name: 'Peak Fitness Gym', email: 'peakfitness@gmail.com', phone: '+234 805 678 9012', website: 'https://peakfitness.com', address: '15 Toyin Street, Lagos', category: 'Fitness', engine: 'ads_intent', verified: true },
  { id: '7', name: 'Crystal Clear Optics', email: 'info@crystaloptics.ng', phone: '+234 806 789 0123', website: undefined, address: '22 Marina Road, Lagos', category: 'Healthcare', engine: 'smb_maps', verified: true },
  { id: '8', name: 'Smooth Auto Repairs', email: 'smoothauto@yahoo.com', phone: '+234 807 890 1234', website: undefined, address: '9 Mechanic Village, Abuja', category: 'Automotive', engine: 'web_absent', verified: false },
]

const engineIcons: Record<EngineType, React.ReactNode> = {
  ads_intent: <Target className="w-4 h-4" />,
  smb_maps: <MapPin className="w-4 h-4" />,
  web_absent: <Globe className="w-4 h-4" />,
  social_intent: <MessageSquare className="w-4 h-4" />,
}

const engineColors: Record<EngineType, string> = {
  ads_intent: 'var(--color-orange)',
  smb_maps: 'var(--color-blue)',
  web_absent: 'var(--color-red)',
  social_intent: 'var(--color-green)',
}

export default function DashboardPage() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Lead[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (data: {
    engine: EngineType
    query: string
    continent: string
    country: string
    stateRegion: string
  }) => {
    setIsSearching(true)
    setHasSearched(true)
    
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Use mock data filtered by engine
    const filtered = data.engine === 'ads_intent' 
      ? mockLeads.filter(l => l.engine === 'ads_intent' || l.engine === 'smb_maps')
      : data.engine === 'web_absent'
        ? mockLeads.filter(l => l.engine === 'web_absent')
        : mockLeads
    
    setSearchResults(filtered)
    setIsSearching(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-midnight)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Ready to find real leads
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              No more guessing. No more bad data. Search and get verified contacts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CoinBalance balance={250} size="md" />
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)] transition-all"
            >
              <Coins className="w-3.5 h-3.5 text-[var(--color-coin)]" />
              Get More Coins
            </Link>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Leads"
            value="1,247"
            subtitle="All time"
            icon={<TrendingUp className="w-5 h-5" />}
            trend={{ value: 12, label: 'this week' }}
            color="var(--color-accent)"
            delay={0}
          />
          <StatCard
            title="Verified Emails"
            value="1,089"
            subtitle="87.3% rate"
            icon={<Search className="w-5 h-5" />}
            trend={{ value: 8, label: 'this week' }}
            color="var(--color-green)"
            delay={0.05}
          />
          <StatCard
            title="Searches Today"
            value="3 / 5"
            subtitle="Explorer plan"
            icon={<LayoutDashboard className="w-5 h-5" />}
            color="var(--color-blue)"
            delay={0.1}
          />
          <StatCard
            title="Coin Balance"
            value="250"
            subtitle="50 reserved"
            icon={<Coins className="w-5 h-5" />}
            color="var(--color-coin)"
            delay={0.15}
          />
        </div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <SearchBar
            onSearch={handleSearch}
            isLoading={isSearching}
            coinBalance={250}
          />
        </motion.div>

        {/* Search Results / Loading */}
        {(isSearching || hasSearched) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {isSearching ? (
              <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
                <div className="flex flex-col items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-purple)] flex items-center justify-center mb-4"
                  >
                    <Search className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Finding verified leads...
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Checking emails against real mail servers
                  </p>
                  <div className="flex gap-2 mt-4">
                    {['ads_intent', 'smb_maps', 'web_absent', 'social_intent'].map((engine, i) => (
                      <motion.div
                        key={engine}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.3 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: `${engineColors[engine as EngineType]}15`,
                          color: engineColors[engine as EngineType],
                        }}
                      >
                        {engineIcons[engine as EngineType]}
                      </motion.div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div className="w-64 h-1.5 rounded-full bg-[var(--color-deep-blue)] mt-6 overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.5, ease: 'easeInOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Search Results
                  </h2>
                  <Link
                    href="/dashboard/results/latest"
                    className="flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
                  >
                    View Full Results
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {/* Results Preview */}
                <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Business</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider hidden sm:table-cell">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider hidden md:table-cell">Website</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider hidden lg:table-cell">Engine</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.slice(0, 5).map((lead, i) => {
                        const engine = (lead.engine || 'ads_intent') as EngineType
                        return (
                          <motion.tr
                            key={lead.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-hover)] transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-[var(--color-text-primary)]">{lead.name}</p>
                              <p className="text-xs text-[var(--color-text-tertiary)]">{lead.category}</p>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <p className="text-xs text-[var(--color-text-secondary)]">{lead.email || 'No email found'}</p>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              {lead.website ? (
                                <span className="text-xs text-[var(--color-accent)]">{lead.website.replace(/^https?:\/\//, '')}</span>
                              ) : (
                                <span className="text-xs text-[var(--color-red)]">No website</span>
                              )}
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span
                                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{
                                  color: engineColors[engine],
                                  background: `${engineColors[engine]}10`,
                                }}
                              >
                                {engineIcons[engine]}
                                {engine.replace('_', ' ')}
                              </span>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {searchResults.length > 5 && (
                    <div className="p-3 text-center border-t border-[var(--color-border)]">
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        +{searchResults.length - 5} more results
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Recent Searches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Recent Searches</h2>
            <Link
              href="/dashboard/history"
              className="flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockRecentSearches.map((search, i) => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${engineColors[search.engine]}10`,
                      color: engineColors[search.engine],
                    }}
                  >
                    {engineIcons[search.engine]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{search.query}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{search.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {search.leads} leads
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    search.status === 'completed' 
                      ? 'bg-[var(--color-green-bg)] text-[var(--color-green)]' 
                      : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  }`}>
                    {search.status === 'completed' ? 'Done' : 'Working...'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
