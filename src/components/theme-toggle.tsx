'use client'

import { useTheme } from '@/components/theme-provider'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--border-light)] transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
      ) : (
        <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
      )}
    </motion.button>
  )
}
