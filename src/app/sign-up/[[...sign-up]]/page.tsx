import { SignUp } from '@clerk/nextjs'

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
          <p className="text-sm text-[var(--text-secondary)] mt-1">Get 50 free coins to start finding leads</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'rounded-2xl border border-[var(--border-color)] shadow-sm bg-[var(--bg-primary)]',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              formButtonPrimary: 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] hover:opacity-90 text-white h-11 font-semibold rounded-xl',
              formFieldInput: 'border-[var(--border-color)] h-11 rounded-xl bg-[var(--bg-surface)]',
              footerActionLink: 'text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium',
              socialButtonsBlockButton: 'border-[var(--border-color)] h-11 font-medium text-[var(--text-primary)] rounded-xl',
              dividerLine: 'bg-[var(--border-color)]',
              dividerText: 'text-[var(--text-tertiary)] text-xs',
              formFieldLabel: 'text-[var(--text-secondary)] font-medium',
              identityPreviewText: 'text-[var(--text-primary)]',
              alertText: 'text-sm',
            },
          }}
          signInUrl="/sign-in"
          forceSignInUrl="/sign-in"
          redirectUrl="/dashboard"
          afterSignUpUrl="/dashboard"
          afterSignInUrl="/dashboard"
        />
      </div>
    </div>
  )
}
