/**
 * BAD DECISION AI — Contact Page
 */
'use client'

import { useAppStore } from '@/stores/app-store'

export function ContactPage() {
  const setView = useAppStore((s) => s.setView)

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => setView('landing')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-royal flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-bold text-lg text-slate">Bad Decision AI</span>
          </button>
          <button onClick={() => setView('landing')} className="text-sm text-slate/60 hover:text-royal transition">
            Back to Home
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-slate mb-4 text-center">Contact Us</h1>
        <p className="text-slate/60 text-center mb-12">
          Have questions or need help? Reach out and we will get back to you within 24 hours.
        </p>

        <div className="bg-white rounded-xl border border-border p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Your Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Message</label>
              <textarea
                rows={5}
                placeholder="How can we help?"
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-royal focus:ring-1 focus:ring-royal outline-none transition text-sm resize-none"
              />
            </div>
            <button className="w-full py-3 bg-royal text-white rounded-lg font-medium hover:bg-royal-hover transition">
              Send Message
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate/40 text-sm">
            Or email us directly at{' '}
            <a href="mailto:support@baddecision.ai" className="text-royal hover:underline">
              support@baddecision.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
