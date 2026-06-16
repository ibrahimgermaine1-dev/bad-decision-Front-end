'use client'

/**
 * LocationSelector — 3-level cascade: Continent → Country → State/Region
 * Clear, visible dropdowns. Not tucked under the screen.
 * Fully responsive for mobile and tablet.
 */
import { useState, useRef, useEffect } from 'react'
import {
  CONTINENTS,
  COUNTRIES,
  getStates,
  getCountriesByContinent,
  searchCountries,
  getCountryByCode,
  countryCodeToFlag,
  type Country,
} from '@/lib/locations'

interface LocationSelectorProps {
  country: string
  stateRegion: string
  onCountryChange: (country: string) => void
  onStateChange: (state: string) => void
}

export function LocationSelector({ country, stateRegion, onCountryChange, onStateChange }: LocationSelectorProps) {
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showStateDropdown, setShowStateDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContinent, setSelectedContinent] = useState<string>('all')

  const countryRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false)
      }
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setShowStateDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCountry = getCountryByCode(country)
  const states = getStates(country)

  // Filter countries by continent and search query
  let filteredCountries: Country[]
  if (searchQuery) {
    filteredCountries = searchCountries(searchQuery)
  } else if (selectedContinent !== 'all') {
    filteredCountries = getCountriesByContinent(selectedContinent)
  } else {
    filteredCountries = COUNTRIES
  }

  const handleCountrySelect = (code: string) => {
    onCountryChange(code)
    onStateChange('')
    setShowCountryDropdown(false)
    setSearchQuery('')
    setSelectedContinent('all')
  }

  const handleStateSelect = (stateCode: string) => {
    onStateChange(stateCode)
    setShowStateDropdown(false)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Country Selector */}
      <div ref={countryRef} className="relative">
        <label className="block text-[12px] font-medium text-[#A8A8B8] mb-1.5 uppercase tracking-wide">
          Country
        </label>
        <button
          type="button"
          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-[#08080C] border border-[#25252F] hover:border-[#3D3D4A] focus:border-[#7C5CFC] text-left transition-colors"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            {selectedCountry ? (
              <>
                <span className="text-xl flex-shrink-0">{selectedCountry.flag}</span>
                <span className="text-[14px] text-[#F5F5F7] truncate">{selectedCountry.name}</span>
              </>
            ) : (
              <span className="text-[14px] text-[#6B6B7B]">Select country</span>
            )}
          </span>
          <svg className={`w-4 h-4 text-[#6B6B7B] flex-shrink-0 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCountryDropdown && (
          <div className="absolute z-50 mt-2 w-full bg-[#14141C] border border-[#25252F] rounded-xl shadow-2xl overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-[#25252F]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search countries..."
                className="w-full px-3 py-2 rounded-lg bg-[#08080C] border border-[#25252F] focus:border-[#7C5CFC] text-[#F5F5F7] text-[14px] outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* Continent Filter */}
            {!searchQuery && (
              <div className="p-3 border-b border-[#25252F]">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedContinent('all')}
                    className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                      selectedContinent === 'all'
                        ? 'bg-[#7C5CFC] text-white'
                        : 'bg-[#08080C] text-[#A8A8B8] hover:text-[#F5F5F7]'
                    }`}
                  >
                    All
                  </button>
                  {CONTINENTS.map(cont => (
                    <button
                      key={cont.code}
                      onClick={() => setSelectedContinent(cont.code)}
                      className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                        selectedContinent === cont.code
                          ? 'bg-[#7C5CFC] text-white'
                          : 'bg-[#08080C] text-[#A8A8B8] hover:text-[#F5F5F7]'
                      }`}
                    >
                      {cont.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Country List */}
            <div className="max-h-64 overflow-y-auto scrollbar-hide">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-[14px] text-[#6B6B7B]">No countries found</div>
              ) : (
                filteredCountries.map(c => (
                  <button
                    key={c.code}
                    onClick={() => handleCountrySelect(c.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#1A1A24] transition-colors ${
                      c.code === country ? 'bg-[#1A1535]' : ''
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{c.flag}</span>
                    <span className="text-[14px] text-[#F5F5F7]">{c.name}</span>
                    {c.popular && (
                      <span className="ml-auto text-[10px] text-[#7C5CFC] font-semibold uppercase">Popular</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* State/Region Selector */}
      <div ref={stateRef} className="relative">
        <label className="block text-[12px] font-medium text-[#A8A8B8] mb-1.5 uppercase tracking-wide">
          State / Region
        </label>
        <button
          type="button"
          onClick={() => states.length > 0 && setShowStateDropdown(!showStateDropdown)}
          disabled={states.length === 0}
          className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-[#08080C] border border-[#25252F] hover:border-[#3D3D4A] focus:border-[#7C5CFC] text-left transition-colors ${
            states.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className="text-[14px] text-[#F5F5F7] truncate">
            {stateRegion
              ? (states.find(s => s.code === stateRegion)?.name || stateRegion)
              : (states.length > 0 ? 'Select state or region' : 'No states available')}
          </span>
          {states.length > 0 && (
            <svg className={`w-4 h-4 text-[#6B6B7B] flex-shrink-0 transition-transform ${showStateDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {showStateDropdown && states.length > 0 && (
          <div className="absolute z-50 mt-2 w-full bg-[#14141C] border border-[#25252F] rounded-xl shadow-2xl overflow-hidden">
            <div className="max-h-64 overflow-y-auto scrollbar-hide">
              {states.map(s => (
                <button
                  key={s.code}
                  onClick={() => handleStateSelect(s.code)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-[#1A1A24] transition-colors ${
                    s.code === stateRegion ? 'bg-[#1A1535]' : ''
                  }`}
                >
                  <span className="text-[14px] text-[#F5F5F7]">{s.name}</span>
                  {s.code === stateRegion && (
                    <svg className="w-4 h-4 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
