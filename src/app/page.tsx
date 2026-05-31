/**
 * Bad Decision AI — Main Page (Server Component)
 * 
 * This is a Server Component that forces dynamic rendering.
 * The actual app logic lives in the Client Component <BadDecisionApp />.
 * 
 * WHY force-dynamic? This is a Single-Page App with view-based routing.
 * Static generation doesn't make sense here because the page content
 * depends on client-side state (Zustand store). Forcing dynamic
 * rendering also prevents build-time crashes from env vars, fonts,
 * or client-side APIs that aren't available during build.
 */
export const dynamic = 'force-dynamic'

import { BadDecisionApp } from '@/components/app'

export default function Page() {
  return <BadDecisionApp />
}
