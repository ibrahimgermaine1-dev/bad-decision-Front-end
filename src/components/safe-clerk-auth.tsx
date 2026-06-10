'use client'

/**
 * SafeClerkAuth — Clerk Appearance Overrides
 * Wraps Clerk components with fixed styling for Google OAuth button readability.
 * Light mode: white bg + dark text
 * Dark mode: dark bg + white text
 */

export const CLERK_APPEARANCE = {
  elements: {
    socialButtonsBlockButton:
      'border border-[#E2E8F0] bg-white rounded-xl hover:bg-[#F8FAFC] dark:bg-[#1e293b] dark:border-[#334155] dark:hover:bg-[#334155]',
    socialButtonsProviderText:
      'text-[#1f2937] font-medium dark:text-[#f1f5f9]',
    socialButtonsIconButton:
      'border border-[#E2E8F0] bg-white dark:bg-[#1e293b] dark:border-[#334155]',
    formButtonPrimary:
      'bg-[#2563EB] hover:bg-[#1D4ED8] text-white',
    formFieldInput:
      'border-[#E2E8F0] h-11',
    card: 'border-[#E2E8F0]',
  },
} as const

export const CLERK_SIGN_IN_APPEARANCE = {
  ...CLERK_APPEARANCE,
} as const

export const CLERK_SIGN_UP_APPEARANCE = {
  ...CLERK_APPEARANCE,
} as const
