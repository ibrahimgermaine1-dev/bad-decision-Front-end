'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Globe, MapPin, Map } from 'lucide-react'
import { locationData, getCountriesForContinent, getStatesForCountry } from '@/lib/locations'

interface LocationSelectorProps {
  onLocationChange: (location: { continent: string; country: string; stateRegion: string }) => void
  initialContinent?: string
  initialCountry?: string
  initialState?: string
}

export function LocationSelector({ onLocationChange, initialContinent, initialCountry, initialState }: LocationSelectorProps) {
  const [continent, setContinent] = useState(initialContinent || '')
  const [country, setCountry] = useState(initialCountry || '')
  const [stateRegion, setStateRegion] = useState(initialState || '')

  const countries = useMemo(() => getCountriesForContinent(continent), [continent])
  const states = useMemo(() => getStatesForCountry(continent, country), [continent, country])

  const handleContinentChange = (value: string) => {
    setContinent(value)
    setCountry('')
    setStateRegion('')
    onLocationChange({ continent: value, country: '', stateRegion: '' })
  }

  const handleCountryChange = (value: string) => {
    setCountry(value)
    setStateRegion('')
    onLocationChange({ continent, country: value, stateRegion: '' })
  }

  const handleStateChange = (value: string) => {
    setStateRegion(value)
    onLocationChange({ continent, country, stateRegion: value })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {/* Continent Selector */}
      <CustomSelect
        icon={<Globe className="w-4 h-4" />}
        placeholder="Continent"
        value={continent}
        onChange={handleContinentChange}
        options={locationData.map(c => ({ value: c.value, label: `${c.emoji} ${c.label}` }))}
        accentColor="var(--color-accent)"
      />

      {/* Country Selector */}
      <AnimatePresence mode="wait">
        {continent && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <CustomSelect
              icon={<Map className="w-4 h-4" />}
              placeholder="Country"
              value={country}
              onChange={handleCountryChange}
              options={countries.map(c => ({ value: c.value, label: c.label }))}
              accentColor="var(--color-accent)"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* State/Region Selector */}
      <AnimatePresence mode="wait">
        {country && states.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="flex-1"
          >
            <CustomSelect
              icon={<MapPin className="w-4 h-4" />}
              placeholder="State / Region"
              value={stateRegion}
              onChange={handleStateChange}
              options={states}
              accentColor="var(--color-accent-purple)"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Premium Custom Select with Dropdown
interface CustomSelectProps {
  icon: React.ReactNode
  placeholder: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  accentColor?: string
}

function CustomSelect({ icon, placeholder, value, onChange, options, accentColor = 'var(--color-accent)' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selectedLabel = options.find(o => o.value === value)?.label

  const filteredOptions = useMemo(() => {
    if (!search) return options
    return options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  }, [options, search])

  return (
    <div className="relative flex-1 min-w-[140px]">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearch('') }}
        className={`
          w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
          bg-[var(--bg-surface)] border transition-all duration-200
          text-left text-sm
          ${isOpen 
            ? `border-[var(--color-accent)] glow-accent` 
            : value 
              ? 'border-[var(--border-light)]' 
              : 'border-[var(--border-color)] hover:border-[var(--border-light)]'
          }
        `}
      >
        <span className={value ? 'text-[var(--color-accent)]' : 'text-[var(--text-tertiary)]'}>
          {icon}
        </span>
        <span className={`flex-1 truncate ${value ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl overflow-hidden"
              style={{ boxShadow: 'var(--shadow-dropdown)' }}
            >
              {/* Search */}
              <div className="p-2 border-b border-[var(--border-color)]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  autoFocus
                />
              </div>

              {/* Options */}
              <div className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-[var(--text-tertiary)]">
                    No results found
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value)
                        setIsOpen(false)
                        setSearch('')
                      }}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-all
                        ${option.value === value
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                        }
                      `}
                    >
                      {option.value === value && (
                        <motion.div
                          layoutId={`select-indicator-${placeholder}`}
                          className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
                        />
                      )}
                      <span className="truncate">{option.label}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
