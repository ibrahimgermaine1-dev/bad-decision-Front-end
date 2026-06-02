'use client'

/**
 * SHARED FOOTER — Used on every marketing page
 * Midnight navy background. Nav links + copyright.
 */

import { useAppStore } from '@/stores/app-store'

export function Footer() {
  const { setView } = useAppStore()

  return (
    <footer className="bg-[#0B1120] border-t border-[#1E293B] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <span className="text-white font-semibold">Bad Decision AI</span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Find real business contacts. Check every email. Pay only for what works.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <div className="space-y-2">
              <button onClick={() => setView('solutions')} className="block text-[#94A3B8] hover:text-white text-sm transition-colors">Solutions</button>
              <button onClick={() => setView('pricing')} className="block text-[#94A3B8] hover:text-white text-sm transition-colors">Pricing</button>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
            <div className="space-y-2">
              <button onClick={() => setView('faq')} className="block text-[#94A3B8] hover:text-white text-sm transition-colors">FAQ</button>
              <button onClick={() => setView('contact')} className="block text-[#94A3B8] hover:text-white text-sm transition-colors">Contact Us</button>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <div className="space-y-2">
              <button onClick={() => setView('signup')} className="block text-[#94A3B8] hover:text-white text-sm transition-colors">Get Started</button>
              <button onClick={() => setView('signin')} className="block text-[#94A3B8] hover:text-white text-sm transition-colors">Sign In</button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1E293B] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#475569] text-sm">2026 Bad Decision AI. All rights reserved.</p>
          <p className="text-[#475569] text-xs">Payments processed securely. We never see your card details.</p>
        </div>
      </div>
    </footer>
  )
}
