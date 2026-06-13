'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

/**
 * SSO Callback Page
 * Handles OAuth redirects (Google, etc.) from Clerk.
 */
export default function SSOCallback() {
  return <AuthenticateWithRedirectCallback />
}
