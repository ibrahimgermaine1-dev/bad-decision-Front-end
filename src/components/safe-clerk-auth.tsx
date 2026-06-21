'use client'

/**
 * Clerk Appearance Overrides
 * ==========================
 * Used by `src/app/client-providers.tsx` to theme the Clerk <SignIn> and
 * <SignUp> components to match the Bad Decision teal design system.
 *
 * (Previously this file also contained a `useClerkAuth` safe-hook wrapper
 * and a `ClerkErrorBoundary` class. Both were unused dead code and have
 * been removed. Use `useAuth` / `useUser` from `@clerk/nextjs` directly.)
 */
export const CLERK_APPEARANCE = {
  elements: {
    socialButtonsBlockButton:
      'border border-border bg-white rounded-xl hover:bg-muted dark:bg-card dark:border-border dark:hover:bg-card-foreground/10',
    socialButtonsProviderText:
      'text-foreground font-medium dark:text-card-foreground',
    socialButtonsIconButton:
      'border border-border bg-white dark:bg-card dark:border-border',
    formButtonPrimary:
      'bg-accent hover:bg-accent/90 text-white',
    formFieldInput:
      'border-border h-11',
    card: 'border-border',
  },
} as const

export const CLERK_SIGN_IN_APPEARANCE = {
  ...CLERK_APPEARANCE,
} as const

export const CLERK_SIGN_UP_APPEARANCE = {
  ...CLERK_APPEARANCE,
} as const
