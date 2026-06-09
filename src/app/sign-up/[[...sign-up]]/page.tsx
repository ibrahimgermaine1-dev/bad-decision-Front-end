import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'rounded-2xl border border-[var(--border-color)] shadow-sm',
            headerTitle: 'text-2xl font-bold text-[var(--text-primary)] tracking-tight',
            headerSubtitle: 'text-[var(--text-secondary)] text-sm',
            formButtonPrimary: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white h-11 font-semibold',
            formFieldInput: 'border-[var(--border-color)] h-11',
            footerActionLink: 'text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium',
            socialButtonsBlockButton: 'border-[var(--border-color)] h-11 font-medium text-[var(--text-primary)]',
          },
        }}
        signInUrl="/sign-in"
        redirectUrl="/"
      />
    </div>
  )
}
