/**
 * Skeleton loading primitives.
 * Each skeleton MATCHES the actual page layout it represents —
 * same structure, same spacing, same number of cards.
 * Users see the exact page shape in grey before real data arrives.
 */

import { cn } from '@/lib/utils'

/**
 * Base skeleton block — animated grey rectangle.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/70', className)}
      {...props}
    />
  )
}

/**
 * Dashboard shell skeleton — matches the SearchView page exactly.
 * Used during the initial dashboard load (Clerk + profile + balance fetch).
 *
 * Layout matches SearchView:
 *   - Sidebar (hidden on mobile)
 *   - "Find Real Buyers" header
 *   - Engine selection card (3 engine options)
 *   - Search form card (location selector + query input + search button)
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* ===== SIDEBAR (matches actual sidebar) ===== */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border sticky top-0 h-screen">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
        {/* Nav items (matches the 7 actual nav items) */}
        <nav className="flex-1 p-3 space-y-1">
          {['Search', 'Collections', 'Credit Vault', 'Billing', 'Messages', 'Settings', 'Support'].map((_, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${i === 0 ? 'bg-primary/10' : ''}`}>
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </nav>
        {/* User profile at bottom */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT (matches SearchView) ===== */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header: "Find Real Buyers" */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        {/* Engine selection label */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          {/* 3 engine cards (matches ENGINE_CARDS array) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="card-premium p-4 space-y-2.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Search form card */}
        <div className="card-premium p-6 space-y-4">
          {/* Location selector (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
          {/* Query input */}
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          {/* Search button */}
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </main>
    </div>
  )
}

/**
 * Billing view skeleton — matches BillingView exactly.
 * Layout:
 *   - Header
 *   - Current plan card (with cancel button)
 *   - 4 tier cards (Free, Starter, Growth, Pro)
 *   - Transaction history
 */
export function BillingViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Current plan card */}
      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          {[0, 1, 2].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* 4 tier cards */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="card-premium p-5 space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-24" />
              <div className="space-y-1.5">
                {[0, 1, 2, 3, 4].map(j => (
                  <Skeleton key={j} className="h-3 w-full" />
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div className="card-premium p-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        {[0, 1, 2].map(i => (
          <div key={i} className="flex justify-between items-center py-3 border-t border-border">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Collections view skeleton — matches CollectionsView exactly.
 * Layout: grouped by engine type, each group has a header + collection cards.
 */
export function CollectionsViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* 3 engine groups (Companies, Ads Running, Ecommerce) */}
      {[0, 1, 2].map(group => (
        <div key={group} className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0, 1, 2].map(card => (
              <div key={card} className="card-premium p-4 space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Credits view skeleton — matches CreditsView exactly.
 * Layout: header + balance hero card + credit packs grid.
 */
export function CreditsViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Balance hero card */}
      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-32" />
          </div>
          <Skeleton className="w-16 h-16 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          {[0, 1].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Credit packs */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="card-premium p-5 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Messages view skeleton — matches MessagesView exactly.
 */
export function MessagesViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="card-premium p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-start gap-3 py-3 border-t border-border">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Settings view skeleton — matches SettingsView exactly.
 */
export function SettingsViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="card-premium p-6 space-y-5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Lead list skeleton — used during search and collection detail.
 * Matches the ResultsView lead card layout.
 */
export function LeadsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-premium p-5 space-y-2.5">
          {/* Row 1: company name + badges */}
          <div className="flex justify-between items-start gap-3">
            <Skeleton className="h-5 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>
          </div>
          {/* Row 2: website link */}
          <Skeleton className="h-4 w-2/3" />
          {/* Row 3: contact row */}
          <div className="flex gap-3">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          {/* Row 4: engine details */}
          <div className="flex gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
