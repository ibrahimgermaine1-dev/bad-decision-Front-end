export const dynamic = 'force-dynamic'

import { SafeSignUp } from '@/components/safe-clerk-auth'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center pt-16">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-purple)] flex items-center justify-center">
              <span className="text-white font-bold">BD</span>
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">Bad Decision</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create your account</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Get 250 free coins to start finding leads</p>
        </div>
        <SafeSignUp />
      </div>
    </div>
  )
}
