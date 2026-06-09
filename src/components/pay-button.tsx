'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Loader2, Shield } from 'lucide-react'

interface PayButtonProps {
  planType: string
  packageId?: string
  email: string
  userId: string
  label?: string
  variant?: 'primary' | 'secondary'
  onSuccess?: (data: { authorization_url: string; reference: string }) => void
  onError?: (error: string) => void
}

export function PayButton({
  planType,
  packageId,
  email,
  userId,
  label = 'Pay Now',
  variant = 'primary',
  onSuccess,
  onError,
}: PayButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bad-decision-api.onrender.com'
      const response = await fetch(`${BACKEND_URL}/api/paystack/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planType,
          packageId,
          email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Payment initialization failed')
      }

      if (onSuccess) {
        onSuccess(data)
      } else {
        // Default: redirect to Paystack
        window.location.href = data.authorization_url
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <motion.button
        type="button"
        onClick={handlePayment}
        disabled={isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all
          ${variant === 'primary'
            ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white hover:shadow-lg hover:shadow-[var(--color-accent)]/20'
            : 'bg-[var(--color-surface-light)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CreditCard className="w-4 h-4" />
        )}
        {isLoading ? 'Processing...' : label}
      </motion.button>
      <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--color-text-tertiary)]">
        <Shield className="w-3 h-3" />
        Secured by Paystack
      </div>
    </div>
  )
}
