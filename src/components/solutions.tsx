'use client'

/**
 * SOLUTIONS PAGE — What We Do For You
 * 4 search engines explained in plain English.
 * Direct-response copy. No emojis. No tech jargon.
 */

import { useAppStore } from '@/stores/app-store'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

const SOLUTIONS = [
  {
    id: 'ads_intent',
    title: 'Companies Running Ads',
    subtitle: 'Find businesses with money to spend.',
    problem: 'You waste time cold-calling businesses that have no budget. You pitch to companies that cannot afford you. You chase leads that go nowhere because the business is barely surviving.',
    solution: 'Our system finds businesses that are actively spending money on advertising. If a company is running Facebook ads or Google ads, they have a marketing budget. They are already investing in growth. These are the businesses most likely to buy from you.',
    whoIsItFor: 'Marketing agencies, web designers, SEO consultants, and any B2B service provider who wants to target businesses with proven budgets.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    id: 'smb_maps',
    title: 'Local Businesses',
    subtitle: 'Find brick-and-mortar shops, clinics, and agencies near you.',
    problem: 'You spend hours scrolling through Google Maps, writing down names and numbers by hand. Half the listings are outdated. The phone numbers do not work. The business closed six months ago and nobody updated the listing.',
    solution: 'Our system scans local business directories and cross-checks every listing. We verify the business is still operating. We find the decision maker. We test the email address. You get a clean list of real, active local businesses ready to hear from you.',
    whoIsItFor: 'Local SEO agencies, website builders, print shops, and anyone selling services to small businesses in specific cities or regions.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'web_absent',
    title: 'Businesses Without Websites',
    subtitle: 'The goldmine for web developers and designers.',
    problem: 'You know there are thousands of businesses out there that need a website. But finding them is like searching for a needle in a haystack. You cannot just Google "businesses without websites." That search does not work.',
    solution: 'Our system finds businesses that are listed on directories like Yelp, Houzz, and Google Maps but do not have their own website. These are businesses that already know they need an online presence because they are listed somewhere. They just have not taken the step yet. That is where you come in.',
    whoIsItFor: 'Web developers, web designers, digital agencies, and anyone who builds or sells websites and online presence services.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    id: 'social_intent',
    title: 'People Asking For Help',
    subtitle: 'Find buyers who are looking for your service right now.',
    problem: 'Your ideal customer is posting on social media right now asking for a recommendation. But you will never see that post. By the time you find it, someone else already responded. You are always too late.',
    solution: 'Our system monitors social platforms in real time. When someone posts that they need a roofer, a plumber, a designer, or any service, we find that post and deliver it to you. You are the first to respond. You win the job.',
    whoIsItFor: 'Service providers, freelancers, contractors, and any business that wants to be the first to respond when a potential customer asks for help online.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

export function SolutionsPage() {
  const { setView } = useAppStore()

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight">
            Four Ways To Find Your Next Customer.
          </h1>
          <p className="mt-6 text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Every business is different. That is why we built four separate search engines. Each one finds a different type of lead. Pick the one that fits your business.
          </p>
        </div>
      </section>

      {/* Solutions */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          {SOLUTIONS.map((sol, idx) => (
            <div
              key={sol.id}
              id={sol.id}
              className={`rounded-2xl p-10 md:p-12 ${
                idx % 2 === 0 ? 'bg-white border border-[#E2E8F0]' : 'bg-[#0B1120]'
              }`}
            >
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  idx % 2 === 0 ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[#2563EB]/20 text-[#2563EB]'
                }`}>
                  {sol.icon}
                </div>
                <div className="flex-1">
                  <h2 className={`text-2xl md:text-3xl font-bold ${idx % 2 === 0 ? 'text-[#0F172A]' : 'text-white'}`}>
                    {sol.title}
                  </h2>
                  <p className={`mt-1 text-lg font-medium ${idx % 2 === 0 ? 'text-[#2563EB]' : 'text-[#2563EB]'}`}>
                    {sol.subtitle}
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${idx % 2 === 0 ? 'text-[#DC2626]' : 'text-[#F87171]'}`}>
                        The Problem
                      </h3>
                      <p className={idx % 2 === 0 ? 'text-[#475569] leading-relaxed' : 'text-[#94A3B8] leading-relaxed'}>
                        {sol.problem}
                      </p>
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${idx % 2 === 0 ? 'text-[#16A34A]' : 'text-[#4ADE80]'}`}>
                        Our Solution
                      </h3>
                      <p className={idx % 2 === 0 ? 'text-[#475569] leading-relaxed' : 'text-[#94A3B8] leading-relaxed'}>
                        {sol.solution}
                      </p>
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${idx % 2 === 0 ? 'text-[#0F172A]' : 'text-[#CBD5E1]'}`}>
                        Who Is This For?
                      </h3>
                      <p className={idx % 2 === 0 ? 'text-[#475569] leading-relaxed' : 'text-[#94A3B8] leading-relaxed'}>
                        {sol.whoIsItFor}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0B1120] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready To Find Your Next Customer?</h2>
          <p className="mt-4 text-[#94A3B8] text-lg">Start with 50 free contacts. No credit card. No commitment. Just results.</p>
          <Button
            size="lg"
            onClick={() => setView('signup')}
            className="mt-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-10 py-6 text-base font-semibold"
          >
            Start Finding Buyers — Free
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
