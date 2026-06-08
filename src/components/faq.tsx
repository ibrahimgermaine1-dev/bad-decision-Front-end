/**
 * BAD DECISION AI — FAQ Page
 * Answers focus on what the user GETS, not how the tech works.
 */
'use client'

import { useAppStore } from '@/stores/app-store'
import { useAuth } from '@clerk/nextjs'

const FAQ_ITEMS = [
  {
    q: 'What is Bad Decision AI?',
    a: 'Bad Decision AI helps you find real businesses that need your services. Instead of buying lists full of dead emails and closed companies, you get verified contact information for decision makers who are actually open to hearing from you. You only pay for leads that check out.',
  },
  {
    q: 'What kinds of businesses can I find?',
    a: 'You can find four types: businesses already spending money on ads (they have budgets and need help), local brick-and-mortar shops that need an online presence, businesses listed on directories but without their own website, and people actively posting online that they need help right now. Each type is a different opportunity for your services.',
  },
  {
    q: 'How do you verify the leads?',
    a: 'Every lead goes through our verification process before you pay for it. We confirm the business actually exists, we verify there is real contact information, and at higher tiers we connect directly to the mail server to guarantee the email address works. This means no more bounced emails or chasing ghost businesses.',
  },
  {
    q: 'How does the coin system work?',
    a: 'You buy coins and spend them on verified leads. Free tier leads cost 1 coin each, Starter and Growth leads cost 2 coins each (with enhanced verification), and Pro leads cost 3 coins each (with guaranteed deliverable emails). If a search finds zero results, you pay nothing — your coins stay in your balance.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We use Paystack for all payments. Paystack supports card payments (Visa, Mastercard, Verve), bank transfers, and mobile money. It is the most trusted payment platform in Africa and supports both Nigerian Naira and US Dollars.',
  },
  {
    q: 'Do I get refunded if a lead is bad?',
    a: 'Our verification system is designed to prevent bad leads from reaching you in the first place. At the Pro tier, emails that pass our highest verification level are guaranteed deliverable. And if a search returns zero results, no coins are deducted at all.',
  },
  {
    q: 'Is this a subscription?',
    a: 'No. We use a coin-based system, not subscriptions. You buy coins whenever you need them and spend them on verified leads. There are no recurring charges and no monthly commitments. Top up whenever you want via Paystack.',
  },
  {
    q: 'How fresh is the lead data?',
    a: 'Our data is verified continuously. Cached data is re-verified every 30 days to ensure accuracy. Real-time search results (like people posting about needing help) are fresh from the last hour, so you can reach out while they are still looking.',
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
          Everything you need to know about Bad Decision AI and how it helps you find real leads.
        </p>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group bg-white rounded-xl border border-border overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-ghost/50 transition">
                <span className="font-semibold text-slate pr-4">{item.q}</span>
                <span className="text-royal text-xl font-bold group-open:rotate-45 transition-transform flex-shrink-0">+</span>
              </summary>
              <div className="px-5 pb-5 text-slate/70 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
