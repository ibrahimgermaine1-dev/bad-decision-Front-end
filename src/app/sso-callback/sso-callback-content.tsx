'use client'

/**
 * SSO Callback Content — Only mounted when Clerk is configured.
 * Uses Clerk's AuthenticateWithRedirectCallback component.
 */
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export function SSOCallbackContent() {
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
    />
  )
}
