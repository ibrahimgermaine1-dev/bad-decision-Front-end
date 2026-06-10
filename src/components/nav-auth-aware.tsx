'use client'

/**
 * NavAuthAware — Provides auth state to Navigation component.
 * Two-component pattern: only mounts the Clerk-dependent component
 * when Clerk is configured. This avoids calling hooks conditionally.
 */
import { isClerkConfigured } from '@/lib/clerk-config'
import { NavClerkState } from '@/components/nav-clerk-state'

interface NavAuthState {
  isSignedIn: boolean
  coinBalance: number
  userName: string
  userEmail: string
}

export function NavAuthAware({ children }: { children: (state: NavAuthState) => React.ReactNode }) {
  if (isClerkConfigured()) {
    return <NavClerkState>{children}</NavClerkState>
  }
  // Clerk not configured — always show signed-out state
  return <>{children({ isSignedIn: false, coinBalance: 250, userName: '', userEmail: '' })}</>
}
