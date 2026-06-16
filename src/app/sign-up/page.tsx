'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#08080C] bg-radial-glow bg-grid flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#7C5CFC]/30">
              <span className="text-white font-bold">BD</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-[16px] text-[#F5F5F7]">Bad Decision</div>
              <div className="text-[10px] text-[#6B6B7B] uppercase tracking-wide">Lead Intelligence</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F7] mb-2">Get 50 free leads.</h1>
          <p className="text-[14px] text-[#A8A8B8]">No credit card. No catch. Just real buyers.</p>
        </div>

        <div className="card-premium p-6 sm:p-8">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/dashboard"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent border-0 shadow-none p-0',
                headerTitle: 'text-[#F5F5F7]',
                headerSubtitle: 'text-[#A8A8B8]',
                socialButtonsBlockButton: 'bg-[#14141C] border border-[#25252F] hover:bg-[#1A1A24] text-[#F5F5F7] rounded-lg',
                socialButtonsProviderText: 'text-[#F5F5F7]',
                formFieldLabel: 'text-[#A8A8B8] text-[13px]',
                formFieldInput: 'bg-[#08080C] border border-[#25252F] text-[#F5F5F7] rounded-lg focus:border-[#7C5CFC]',
                formButtonPrimary: 'bg-[#7C5CFC] hover:bg-[#6B4CE6] rounded-lg font-semibold',
                footerActionLink: 'text-[#7C5CFC]',
                formHeaderTitle: 'text-[#F5F5F7]',
                formHeaderSubtitle: 'text-[#A8A8B8]',
                alternativeMethods: 'text-[#A8A8B8]',
              },
            }}
          />
        </div>

        <p className="text-center text-[13px] text-[#6B6B7B] mt-6">
          Already have an account?{' '}
          <a href="/sign-in" className="text-[#7C5CFC] hover:text-[#6B4CE6] font-semibold">
            Sign in
          </a>
        </p>

        <div className="mt-8 flex items-center justify-center gap-6 text-[12px] text-[#6B6B7B]">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            50 free leads
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Cancel anytime
          </span>
        </div>
      </div>
    </div>
  )
}
