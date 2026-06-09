/**
 * BAD DECISION — Dashboard Page (Server Component)
 * Force-dynamic to prevent pre-render issues with Clerk.
 * Renders the client dashboard component.
 */
export const dynamic = 'force-dynamic'

import DashboardClient from './dashboard-client'

export default function DashboardPage() {
  return <DashboardClient />
}
