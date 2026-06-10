'use client'

/**
 * Dashboard Clerk Wrapper — Safely uses Clerk hooks.
 * ONLY mounted when Clerk is configured and inside ClerkProvider.
 * Passes auth state as props to DashboardContent.
 */
import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import { DashboardContent } from './dashboard-client'

export function DashboardWithClerk() {
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()

  return (
    <DashboardContent
      isSignedIn={!!isSignedIn}
      userId={userId}
      user={user}
      signOut={signOut}
    />
  )
}
