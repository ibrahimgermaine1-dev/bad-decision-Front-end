'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Target,
  MapPin,
  Globe,
  MessageSquare,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { LocationSelector } from './location-selector'

export type EngineType = 'ads_intent' | 'smb_maps' | 'web_absent' | 'social_intent'

interface EngineConfig {
  id: EngineType
  name: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  coinCost: number
}

const engines: EngineConfig[] = [
  {
    id: 'ads_intent',
    name: 'Ads Intent',
    description: 'Find businesses running ads',
    icon: <Target className="w-4 h-4" />,
    color: 'var(--color-orange)',
    bgColor: 'var(--color-orange-bg)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    coinCost: 10,
  },
  {
    id: 'smb_maps',
    name: 'SMB Maps',
    description: 'Local brick-and-mortar',
    icon: <MapPin className="w-4 h-4" />,
    color: 'var(--color-blue)',
    bgColor: 'var(--color-blue-bg)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    coinCost: 8,
  },
  {
    id: 'web_absent',
    name: 'Web Absent',
    description: 'No website — huge opportunity',
    icon: <Globe className="w-4 h-4" />,
    color: 'var(--color-red)',
    bgColor: 'var(--color-red-bg)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    coinCost: 12,
  },
  {
    id: 'social_intent',
    name: 'Social Intent',
    description: 'Real-time demand signals',
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'var(--color-green)',
    bgColor: 'var(--color-green-bg)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    coinCost: 15,
  },
]

interface SearchBarProps {
  onSearch: (data: {
    engine: EngineType
    query: string
    continent: string
    country: string
    stateRegion: string
  }) => void
  isLoading?: boolean
  coinBalance?: number
}

export function SearchBar({ onSearch, isLoading = false, coinBalance = 250 }: SearchBarProps) {
  const [activeEngine, setActiveEngine] = useState<EngineType>('ads_intent')
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState({ continent: '', country: '', stateRegion: '' })
  const [showLocation, setShowLocation] = useState(false)

  const currentEngine = engines.find(e => e.id === activeEngine)!

  const handleSearch = () => {
    if (!query.trim() || isLoading) return
    onSearch({
      engine: activeEngine,
      query: query.trim(),
      ...location,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="w-full space-y-4">
      {/* Engine Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {engines.map((engine) => (
          <EngineTab
            key={engine.id}
            engine={engine}
            isActive={activeEngine === engine.id}
            onClick={() => setActiveEngine(engine.id)}
          />
        ))}
      </div>

      {/* Search Input Area */}
      <div className="relative">
        <div className="glass rounded-2xl p-1.5 glow-accent transition-all duration-300">
          {/* Main search row */}
          <div className="flex items-center gap-2 bg-[var(--color-deep-blue)] rounded-xl px-4 py-3">
            <div style={{ color: currentEngine.color }}>
              {currentEngine.icon}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Search with ${currentEngine.name}... e.g. "restaurants", "dentists", "gyms"`}
              className="flex-1 bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] text-sm focus:outline-none"
            />
            
            {/* Location toggle */}
            <button
              type="button"
              onClick={() => setShowLocation(!showLocation)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                location.continent 
                  ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20' 
                  : 'bg-[var(--color-surface)] text-[var(--color-text-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-border-light)]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {location.country ? location.stateRegion ? 'Region Set' : 'Country Set' : 'Location'}
            </button>

            {/* Search button */}
            <motion.button
              type="button"
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-shadow"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isLoading ? 'Searching...' : 'Search'}</span>
            </motion.button>
          </div>

          {/* Location Selector (expandable) */}
          <AnimatePresence>
            {showLocation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Target your search geographically
                    </span>
                  </div>
                  <LocationSelector
                    onLocationChange={setLocation}
                    initialContinent={location.continent}
                    initialCountry={location.country}
                    initialState={location.stateRegion}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cost indicator */}
        <div className="flex items-center justify-between mt-2 px-2">
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
            <span className="flex items-center gap-1">
              <span style={{ color: currentEngine.color }}>{currentEngine.icon}</span>
              {currentEngine.name}
            </span>
            <span>•</span>
            <span>{currentEngine.coinCost} coins per search</span>
            <span>•</span>
            <span>{coinBalance} coins available</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Engine Tab Component
interface EngineTabProps {
  engine: EngineConfig
  isActive: boolean
  onClick: () => void
}

function EngineTab({ engine, isActive, onClick }: EngineTabProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
        ${isActive
          ? 'text-white shadow-lg'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)]'
        }
      `}
      style={isActive ? {
        background: `linear-gradient(135deg, ${engine.color}20, ${engine.color}10)`,
        border: `1px solid ${engine.borderColor}`,
        boxShadow: `0 4px 20px ${engine.color}15`,
      } : {}}
    >
      <span style={{ color: isActive ? engine.color : undefined }}>
        {engine.icon}
      </span>
      <span>{engine.name}</span>
      {isActive && (
        <motion.div
          layoutId="engine-indicator"
          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
          style={{ background: engine.color }}
        />
      )}
    </motion.button>
  )
}

export { engines }
export type { EngineConfig }
