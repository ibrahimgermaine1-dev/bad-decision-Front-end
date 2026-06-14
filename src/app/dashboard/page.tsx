'use client'

/**
 * Dashboard Page — Route entry point for /dashboard
 * Renders the DashboardShell client component.
 * Protected by Clerk middleware (requires authentication).
 */
import { DashboardShell } from './dashboard-client'

export default function DashboardPage() {
  return <DashboardShell />
}
