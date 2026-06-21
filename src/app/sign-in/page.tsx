'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background bg-radial-glow bg-grid flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold">BD</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-[16px] text-foreground">Bad Decision</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Lead Intelligence</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back.</h1>
          <p className="text-[14px] text-muted-foreground">Sign in to find your next real buyer.</p>
        </div>

        <div className="card-premium p-6 sm:p-8">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent border-0 shadow-none p-0',
                headerTitle: 'text-foreground',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton: 'bg-muted border border-border hover:bg-muted/80 text-foreground rounded-lg',
                socialButtonsProviderText: 'text-foreground',
                formFieldLabel: 'text-muted-foreground text-[13px]',
                formFieldInput: 'bg-input border border-border text-foreground rounded-lg focus:border-primary',
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold',
                footerActionLink: 'text-primary',
                formHeaderTitle: 'text-foreground',
                formHeaderSubtitle: 'text-muted-foreground',
                alternativeMethods: 'text-muted-foreground',
              },
            }}
          />
        </div>

        <p className="text-center text-[13px] text-muted-foreground mt-6">
          New here?{' '}
          <a href="/sign-up" className="text-primary hover:text-primary/80 font-semibold">
            Get 50 free leads
          </a>
        </p>
        <p className="text-center text-[11px] text-muted-foreground mt-3">
          Forgot password? Use the &ldquo;Forgot password?&rdquo; link on the sign-in form above.
        </p>
      </div>
    </div>
  )
}
