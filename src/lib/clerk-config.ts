/**
 * Bad Decision — Clerk Configuration Check
 * Determines if Clerk is properly configured at runtime.
 * Used to gracefully degrade when env vars are missing.
 */

/**
 * Check if Clerk publishable key is a real key (not a placeholder).
 * Returns true only if the key starts with "pk_live_" or "pk_test_"
 * and is longer than a placeholder.
 */
export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!key) return false
  // Must start with pk_test_ or pk_live_ and be reasonably long
  if ((key.startsWith('pk_test_') || key.startsWith('pk_live_')) && key.length > 20) {
    // Check it's not obviously a placeholder
    if (key.includes('placeholder') || key.includes('replace') || key.includes('your-')) {
      return false
    }
    return true
  }
  return false
}

/**
 * Get the Clerk publishable key if configured, null otherwise.
 */
export function getClerkKey(): string | null {
  if (isClerkConfigured()) {
    return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!
  }
  return null
}
