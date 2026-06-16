'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
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
          <h1 className="text-2xl font-bold text-[#F5F5F7] mb-2">Welcome back.</h1>
          <p className="text-[14px] text-[#A8A8B8]">Sign in to find your next real buyer.</p>
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
          New here?{' '}
          <a href="/sign-up" className="text-[#7C5CFC] hover:text-[#6B4CE6] font-semibold">
            Get 50 free leads
          </a>
        </p>
      </div>
    </div>
  )
}
