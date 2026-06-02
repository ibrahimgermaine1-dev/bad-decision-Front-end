import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

/**
 * SSO Callback Page
 * Handles OAuth redirect callbacks from Google (and other providers).
 * When a user signs in/up with Google OAuth, Clerk redirects here
 * after the user grants permission. This component completes the
 * authentication flow and redirects the user to the dashboard.
 */
export default function SSOCallback() {
  return <AuthenticateWithRedirectCallback />
}
