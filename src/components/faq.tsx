/**
 * BAD DECISION AI — FAQ Page
 */
'use client'

import { useAppStore } from '@/stores/app-store'
import { useAuth } from '@clerk/nextjs'

const FAQ_ITEMS = [
  {
    q: 'What is Bad Decision AI?',
    a: 'Bad Decision AI is a B2B lead intelligence platform that finds real businesses needing your services. It uses 4 specialized search engines and a 3-gate email validation system to ensure you only pay for verified, deliverable leads.',
  },
  {
    q: 'What are the 4 search engines?',
    a: 'Ads Intelligence finds businesses running ads on Meta and Google. Local SMB Maps finds brick-and-mortar shops with fewer than 50 employees. Web-Absent Aggregators finds businesses on Yelp/Houzz/Etsy without their own website. Social Demand Radar finds people actively posting about needing help on Reddit and GitHub.',
  },
  {
    q: 'What is the 3-gate validation system?',
    a: 'Gate 1 (DNS Check) verifies the website domain exists. Gate 2 (Footprint Check) confirms the lead has at least one contact method. Gate 3 (SMTP Verification) connects directly to the mail server to verify the email inbox exists. Higher tiers unlock more gates for better lead quality.',
  },
  {
    q: 'How does the coin system work?',
    a: 'You spend coins for each verified lead. Free tier leads cost 1 coin (Gate 1 only). Starter/Growth leads cost 2 coins (Gates 1+2). Pro leads cost 3 coins (all 3 gates). If a search finds no leads (exhausted), no coins are deducted. New users get 50 free coins.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We use Paystack for all payments. Paystack supports card payments (Visa, Mastercard, Verve), bank transfers, and mobile money. It is the most trusted payment platform in Africa and supports both NGN and USD currencies.',
  },
  {
    q: 'Do I get refunded if a lead is bad?',
    a: 'Our 3-gate validation system is designed to prevent bad leads. If an email passes SMTP verification at the Pro tier, it is guaranteed deliverable. If a search returns zero results, no coins are deducted.',
  },
  {
    q: 'Can I cancel or change my plan?',
    a: 'Yes! Since we use a coin-based system rather than subscriptions, you simply buy coins as needed. There are no recurring charges. Top up whenever you want via Paystack.',
  },
  {
    q: 'How fresh is the lead data?',
    a: 'Our global cache is considered fresh for 30 days. After that, data is re-validated on the next search. The Social Demand Radar engine only shows posts from the last 60 minutes for maximum freshness.',
  },
]

export function FAQPage() {
  const setView = useAppStore((s) => s.setView)
  const { isSignedIn } = useAuth()

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
          <div className="flex items-center gap-4 text-sm">
            <button onClick={() => setView('pricing')} className="text-slate/60 hover:text-royal transition">Pricing</button>
            {isSignedIn ? (
              <button onClick={() => setView('dashboard-idle')} className="px-4 py-2 bg-royal text-white rounded-lg text-sm font-medium">Dashboard</button>
            ) : (
              <button onClick={() => setView('signin')} className="px-4 py-2 bg-royal text-white rounded-lg text-sm font-medium">Sign In</button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-slate mb-4 text-center">Frequently Asked Questions</h1>
        <p className="text-slate/60 text-center mb-12">
          Everything you need to know about Bad Decision AI, our search engines, validation system, and coin economy.
        </p>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group bg-white rounded-xl border border-border overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-ghost/50 transition">
                <span className="font-semibold text-slate pr-4">{item.q}</span>
                <span className="text-royal text-xl font-bold group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-5 pb-5 text-slate/70 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
