'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'

interface CoinBalanceProps {
  balance: number
  reserved?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function CoinBalance({ balance, reserved = 0, showLabel = true, size = 'md' }: CoinBalanceProps) {
  const [displayBalance, setDisplayBalance] = useState(balance)
  const prevBalance = useRef(balance)

  useEffect(() => {
    if (prevBalance.current === balance) return

    const diff = balance - prevBalance.current
    const steps = 20
    const increment = diff / steps
    let current = prevBalance.current
    let step = 0

    const timer = setInterval(() => {
      step++
      current += increment
      setDisplayBalance(Math.round(current))
      if (step >= steps) {
        setDisplayBalance(balance)
        clearInterval(timer)
        prevBalance.current = balance
      }
    }, 30)

    return () => clearInterval(timer)
  }, [balance])

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-lg gap-2',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const coinIconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <motion.div
        className={`rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ${coinIconSizes[size]}`}
        whileHover={{ scale: 1.1, rotate: 15 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Coins className={`${iconSizes[size]} text-white`} />
      </motion.div>
      <motion.span
        key={displayBalance}
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-bold text-[var(--color-coin)]"
      >
        {displayBalance.toLocaleString()}
      </motion.span>
      {showLabel && (
        <span className="text-[var(--color-text-tertiary)] text-xs">coins</span>
      )}
      {reserved > 0 && (
        <span className="text-[var(--color-text-tertiary)] text-xs ml-1">
          ({reserved} reserved)
        </span>
      )}
    </div>
  )
}
