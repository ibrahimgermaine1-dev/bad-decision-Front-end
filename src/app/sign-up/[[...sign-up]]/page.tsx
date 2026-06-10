'use client'

import { SignUp } from '@clerk/nextjs'
import { CLERK_SIGN_UP_APPEARANCE } from '@/components/safe-clerk-auth'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">BD</span>
            </div>
            <span className="text-xl font-bold text-[#0F172A]">Bad Decision AI</span>
          </div>
        </div>
        <SignUp appearance={CLERK_SIGN_UP_APPEARANCE} />
      </div>
    </div>
  )
}
