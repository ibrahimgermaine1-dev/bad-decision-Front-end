import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

/**
 * SSO Callback Page
 * Handles OAuth redirects (Google, etc.) from Clerk.
 * This page is automatically used by Clerk's redirect flow.
 */
export default function SSOCallback() {
  return <AuthenticateWithRedirectCallback />
}
