'use client'

import { redirect } from 'next/navigation'

/**
 * BAD DECISION — Dashboard Shell (Legacy Redirect)
 * The new dashboard lives at /src/app/dashboard/page.tsx.
 * This component simply redirects to the canonical route.
 */
export function DashboardShell() {
  redirect('/dashboard')
}
