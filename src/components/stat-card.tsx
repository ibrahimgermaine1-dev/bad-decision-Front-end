'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; label: string }
  color?: string
  delay?: number
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'var(--color-accent)', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 hover:border-[var(--color-border-light)] transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-secondary)]">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              {trend.value > 0 ? (
                <TrendingUp className="w-3 h-3 text-[var(--color-green)]" />
              ) : (
                <TrendingDown className="w-3 h-3 text-[var(--color-red)]" />
              )}
              <span className={`text-xs font-medium ${trend.value > 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)]">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
