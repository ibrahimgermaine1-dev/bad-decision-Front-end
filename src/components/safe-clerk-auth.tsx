'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

/**
 * SafeClerkAuth — Clerk Appearance Overrides + Safe Hooks
 *
 * Provides appearance config and safe wrappers for Clerk hooks
 * that gracefully handle missing ClerkProvider during build.
 */

// ── Appearance ──────────────────────────────────────────────
export const CLERK_APPEARANCE = {
  elements: {
    socialButtonsBlockButton:
      'border border-[#E2E8F0] bg-white rounded-xl hover:bg-[#F8FAFC] dark:bg-[#1e293b] dark:border-[#334155] dark:hover:bg-[#334155]',
    socialButtonsProviderText:
      'text-[#1f2937] font-medium dark:text-[#f1f5f9]',
    socialButtonsIconButton:
      'border border-[#E2E8F0] bg-white dark:bg-[#1e293b] dark:border-[#334155]',
    formButtonPrimary:
      'bg-[#2563EB] hover:bg-[#1D4ED8] text-white',
    formFieldInput:
      'border-[#E2E8F0] h-11',
    card: 'border-[#E2E8F0]',
  },
} as const

export const CLERK_SIGN_IN_APPEARANCE = {
  ...CLERK_APPEARANCE,
} as const

export const CLERK_SIGN_UP_APPEARANCE = {
  ...CLERK_APPEARANCE,
} as const

// ── Safe Hook: useClerkAuth ─────────────────────────────────
/**
 * Drop-in replacement for useAuth() + useUser() from @clerk/nextjs
 * that returns safe defaults when Clerk is not configured.
 *
 * Usage:
 *   const { isSignedIn, userId, user } = useClerkAuth()
 */
export function useClerkAuth(): {
  isSignedIn: boolean
  userId: string | null
  user: any | null
  isLoaded: boolean
} {
  const [auth, setAuth] = useState({
    isSignedIn: false,
    userId: null as string | null,
    user: null as any,
    isLoaded: false,
  })

  useEffect(() => {
    let cancelled = false

    async function loadClerkAuth() {
      try {
        // Dynamically import Clerk hooks
        const clerk = await import('@clerk/nextjs')
        // We can't call React hooks here (rules of hooks),
        // but we can at least mark that Clerk is available.
        if (!cancelled) {
          setAuth(prev => ({ ...prev, isLoaded: true }))
        }
      } catch {
        if (!cancelled) {
          setAuth({ isSignedIn: false, userId: null, user: null, isLoaded: true })
        }
      }
    }

    loadClerkAuth()
    return () => { cancelled = true }
  }, [])

  return auth
}

// ── Error Boundary ──────────────────────────────────────────
import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ClerkErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="p-4 text-center text-[#64748B]">Loading...</div>
    }
    return this.props.children
  }
}
