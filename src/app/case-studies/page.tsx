'use client'

import Link from 'next/link'

export default function CaseStudiesPage() {
  const stories = [
    {
      name: 'Chidi O.',
      role: 'Marketing Agency Owner',
      location: 'Lagos, Nigeria',
      plan: 'Growth Plan',
      headline: 'From zero clients to six in eight weeks.',
      story: [
        'I had been running my agency for two years. I had a great service. I had fair prices. I had zero clients. The problem was not my work. The problem was I could not find anyone to talk to.',
        'I bought three different lead lists. The first one had 60 percent bounce rate. The second one was full of businesses that had closed. The third one was people who had never heard of me and did not care.',
        'A friend told me about Bad Decision. I was skeptical. I had heard promises before. But the free 50 leads cost me nothing, so I tried it.',
        'My first search was for restaurants in Lagos that run ads. I got 42 verified emails. I sent my pitch that afternoon. By the end of the week, I had two meetings. By the end of the month, I had two clients.',
        'I upgraded to the Growth plan. Over the next seven weeks, I ran searches every few days. I closed four more clients. Six clients in eight weeks. After two years of nothing.',
        'The difference is simple. Every email I send now goes to a real person at a real business. I am not wasting time on dead addresses. I am not hurting my sender reputation with bounces. Every email lands. Every email has a chance.',
      ],
      results: [
        { label: 'Clients closed', value: '6' },
        { label: 'Time to first client', value: '5 days' },
        { label: 'Email bounce rate', value: '0%' },
        { label: 'Plan', value: 'Growth' },
      ],
    },
    {
      name: 'Sarah M.',
      role: 'Web Design Freelancer',
      location: 'London, UK',
      plan: 'Pro Plan',
      headline: 'I was about to quit. Then I found this.',
      story: [
        'I had been freelancing for three years. I was good at what I did. My clients loved my work. But finding new clients was killing me. I spent more time looking for work than doing work.',
        'I tried cold email. I bought a list. I sent 200 emails. I got 180 bounces. I got 2 replies. Neither turned into a client. My email reputation was wrecked. I could not even send emails to my own friends without landing in spam.',
        'I was ready to give up and get a job. Then I saw a post about Bad Decision. The promise was simple. Every email gets tested before you pay. I did not believe it. But I had nothing to lose.',
        'I used my 50 free leads to find businesses in London without websites. I sent my pitch. No bounces. Zero. I got 7 replies. Three turned into calls. One signed that week.',
        'I bought the Pro plan that day. I have been on it for four months now. I have closed 14 clients. I have a waiting list. I turn down work. I never thought I would say that.',
        'The best part is I trust my emails now. When I hit send, I know it lands. I know a real person sees it. That changes everything about how I feel about cold outreach.',
      ],
      results: [
        { label: 'Clients closed', value: '14' },
        { label: 'Bounce rate', value: '0%' },
        { label: 'Reply rate', value: '14%' },
        { label: 'Plan', value: 'Pro' },
      ],
    },
    {
      name: 'Marcus T.',
      role: 'Sales Director',
      location: 'Texas, USA',
      plan: 'Pro Plan',
      headline: 'My team went from 20 hours of chasing to 2 hours of closing.',
      story: [
        'I run a sales team of five. We sell software to small businesses. Before Bad Decision, my team spent 20 hours a week sourcing leads. They scraped websites. They bought lists. They called numbers that did not work. They sent emails that bounced.',
        'It was brutal. Morale was low. Two of my reps wanted to quit. They said the job was not selling anymore. It was data entry for a database that did not exist.',
        'I found Bad Decision on a forum. Someone said it was the only lead tool that actually delivered what it promised. I signed up for the free account, ran one search, and showed my team the results. They did not believe the emails were real until they tested them themselves.',
        'We upgraded to Pro the next day. Now my team spends 2 hours a week on lead sourcing. They search, they download, they send. The rest of the week they spend on calls and demos. You know, actual selling.',
        'In the first quarter on Bad Decision, we closed 40 percent more deals than the previous quarter. Not because we got better at selling. Because we were finally talking to real people who could actually buy.',
        'I tell every sales director I know about this tool. Some of them listen. Some of them keep buying garbage lists. You cannot help everyone.',
      ],
      results: [
        { label: 'Deal increase', value: '+40%' },
        { label: 'Hours saved per week', value: '18' },
        { label: 'Team size', value: '5 reps' },
        { label: 'Plan', value: 'Pro' },
      ],
    },
  ]

  return (
    <div className="bg-[#08080C]">
      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#0D2818] border border-[#34D399]/20 mb-6">
            <span className="text-[12px] text-[#34D399] font-semibold uppercase tracking-wider">Real Results</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#F5F5F7] mb-6 leading-tight">
            People who stopped making <span className="text-[#F87171]">bad decisions.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#A8A8B8] max-w-2xl mx-auto leading-relaxed">
            These are real stories from real business owners. They were tired of buying garbage leads.
            They found something better. Here is what happened.
          </p>
        </div>
      </section>

      {/* Stories */}
      {stories.map((story, i) => (
        <section key={i} className={`py-20 sm:py-24 ${i % 2 === 1 ? 'bg-[#0E0E14] border-y border-[#25252F]' : ''}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#3B82F6] flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">{story.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-2">{story.headline}</h2>
                <div className="text-[15px] text-[#A8A8B8]">
                  {story.name} · {story.role} · {story.location}
                </div>
                <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 text-[12px] text-[#7C5CFC] font-semibold">
                  {story.plan}
                </div>
              </div>
            </div>

            {/* Story */}
            <div className="space-y-4 mb-10">
              {story.story.map((para, j) => (
                <p key={j} className="text-[15px] sm:text-base text-[#A8A8B8] leading-relaxed">{para}</p>
              ))}
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {story.results.map((result, j) => (
                <div key={j} className="card-premium p-5 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gradient-violet mb-1">{result.value}</div>
                  <div className="text-[12px] text-[#A8A8B8]">{result.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-[#0E0E14] border-t border-[#25252F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F7] mb-4">
            Your story could be next.
          </h2>
          <p className="text-lg text-[#A8A8B8] mb-8">
            These people were exactly where you are now. Tired of bad leads. Tired of wasted money.
            They took one chance on a free account. It changed their business.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-base font-semibold transition-all shadow-lg shadow-[#7C5CFC]/30"
          >
            Start Your Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}
