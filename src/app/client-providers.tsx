'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { CLERK_APPEARANCE } from '@/components/safe-clerk-auth'

/**
 * Client Providers
 *
 * Always wraps with ClerkProvider. Uses the real Clerk key when available,
 * or a format-valid dummy key as fallback so the build doesn't crash.
 *
 * - On Vercel with NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY set → real Clerk auth
 * - During build without the key → dummy key, hooks return signedOut state
 */
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_Y2xlcmsuZHVtbXkuY29tJA'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={CLERK_APPEARANCE}
      publishableKey={PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  )
}
