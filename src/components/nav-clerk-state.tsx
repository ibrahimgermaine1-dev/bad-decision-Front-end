'use client'

/**
 * NavClerkState — Reads Clerk auth state via hooks.
 * ONLY mounted when Clerk is configured (inside ClerkProvider).
 * This avoids the "hooks called outside provider" crash.
 */
import { useAuth, useUser } from '@clerk/nextjs'

interface NavAuthState {
  isSignedIn: boolean
  coinBalance: number
  userName: string
  userEmail: string
}

export function NavClerkState({ children }: { children: (state: NavAuthState) => React.ReactNode }) {
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  const state: NavAuthState = {
    isSignedIn: !!isSignedIn,
    coinBalance: 250, // TODO: connect to real balance from Supabase
    userName: user?.fullName || user?.firstName || '',
    userEmail: user?.emailAddresses?.[0]?.emailAddress || '',
  }

  return <>{children(state)}</>
}
