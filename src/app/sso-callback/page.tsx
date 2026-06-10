/**
 * SSO Callback — Handles OAuth redirects from Clerk.
 * Only renders the Clerk callback when Clerk is configured.
 * Otherwise shows a simple redirect page.
 */
export const dynamic = 'force-dynamic'

import { isClerkConfigured } from '@/lib/clerk-config'
import { SSOCallbackContent } from './sso-callback-content'

export default function SSOCallbackPage() {
  if (!isClerkConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-purple)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">BD</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Redirecting...</h2>
          <p className="text-sm text-[var(--text-secondary)]">Taking you to the dashboard.</p>
          <script dangerouslySetInnerHTML={{ __html: 'setTimeout(function(){ window.location.href = "/dashboard"; }, 1500);' }} />
        </div>
      </div>
    )
  }

  return <SSOCallbackContent />
}
