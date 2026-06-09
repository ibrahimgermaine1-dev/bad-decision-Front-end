'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Coins,
  Mail,
  AlertCircle,
  CreditCard,
  Globe,
  Shield,
  Download,
  Clock,
  HelpCircle,
  ChevronDown,
  MessageSquare,
  Target,
  MapPin,
  CheckCircle2,
} from 'lucide-react'

const faqCategories = [
  {
    title: 'How It Works',
    icon: <Search className="w-5 h-5" />,
    questions: [
      {
        question: 'What exactly do I get when I search?',
        answer: 'You get a list of real business contacts. Depending on the search type, that includes company name, verified email, phone number, website, address, and the name of the decision maker. Every email has been checked against the real mail server. If the server says the address does not exist, you never see it. You can export everything to CSV with one click and start calling today.',
      },
      {
        question: 'How do coins work?',
        answer: 'Coins are how you pay for searches. Each search type costs a different number of coins because some searches take more work to run than others. Ads Intent costs 10 coins per search. SMB Maps costs 8. Web Absent costs 12. Social Intent costs 15. Your plan gives you a monthly pile of coins. You can also buy extra coins anytime. Coins never expire. Use them today or next year. Your choice.',
      },
      {
        question: 'How fast do I get results?',
        answer: 'Most searches return results in under 60 seconds. Some take a bit longer when we are checking a lot of emails at once, but you will always see a progress indicator so you know something is happening. You never sit there wondering if the thing broke.',
      },
      {
        question: 'How is this different from just Googling?',
        answer: 'Google gives you websites. We give you verified contact information. When you Google "plumbers in Lagos," you get a list of websites to click through one by one. When you search with us, you get the business name, the owner\'s name, their verified email, their phone number, and their address all in one list. Plus, we check that the email actually works before you see it. Google does not do that. Google also does not give you a CSV file you can import into your email tool.',
      },
      {
        question: 'Why is it called Bad Decision?',
        answer: 'Because buying bad leads is the worst decision you can make in business. You spend money on a list. Half the emails bounce. You waste hours calling dead numbers. Then you buy another list and do it again. We named this company after that mistake so you never forget it. Every time you log in, you remember: I am done making bad decisions with my money.',
      },
    ],
  },
  {
    title: 'Emails and Verification',
    icon: <Mail className="w-5 h-5" />,
    questions: [
      {
        question: 'Are the emails real and verified?',
        answer: 'Yes. We check every single email against the real mail server before we show it to you. Here is how it works: we connect to the mail server and ask "does this email address exist?" If the server says no, we throw it out and you never see it. If the server says yes, we deliver it to you as a verified contact. Some emails are "catch-all" addresses, which means the server accepts everything sent to that domain. We label those so you know what you are dealing with.',
      },
      {
        question: 'Do I get charged for bad results?',
        answer: 'No. If an email bounces, you do not pay for it. If a phone number is disconnected, you do not pay for it. We eat the cost of bad data so you do not have to. You only pay for contacts that pass our verification. That is the whole point of this service.',
      },
      {
        question: 'What does "verified" actually mean?',
        answer: 'It means we connected to the mail server for that email address and the server confirmed the address exists. This is not a guess. This is not a "probably valid" label. This is an actual handshake with the server that handles emails for that domain. If the server says the address is real, we mark it verified. If it says the address does not exist, we mark it as invalid and you never see it.',
      },
    ],
  },
  {
    title: 'Billing and Plans',
    icon: <CreditCard className="w-5 h-5" />,
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major payment methods through Paystack, including bank transfers, debit cards, and mobile money. If you are in Nigeria, you can pay in Naira. If you are outside Nigeria, we support international cards as well. We are working on adding more payment options.',
      },
      {
        question: 'Can I cancel anytime?',
        answer: 'Yes. Cancel whenever you want. No contracts. No penalties. No hoops to jump through. No phone call where someone tries to talk you out of it. Your remaining coins stay in your account even after you cancel, so you can use them later if you decide to come back.',
      },
      {
        question: 'What if a search finds zero results?',
        answer: 'It happens sometimes. Not every search returns gold. If you search for "underwater welding shops in Antarctica," you probably will not find much. When a search comes back empty, you are not charged for leads. You only pay when we find something useful.',
      },
      {
        question: 'Is there a free plan?',
        answer: 'Yes. The Explorer plan gives you 50 free coins every month. No credit card required. That is enough to run a few searches and see if this tool works for you. We think it will. Most people upgrade after their first week because the results speak for themselves.',
      },
    ],
  },
  {
    title: 'Data and Privacy',
    icon: <Shield className="w-5 h-5" />,
    questions: [
      {
        question: 'Can I export my leads?',
        answer: 'Yes. Every search result can be exported to CSV with one click. The CSV includes all the data we found: company name, email, phone, website, address, category, and verification status. You can import it into your CRM, your email tool, or a spreadsheet. Your leads. Your data. You own it.',
      },
      {
        question: 'Is my data private?',
        answer: 'Yes. We do not sell your search history. We do not share your leads with other users. Your account is yours alone. We store your data securely and delete it when you ask us to. We use encryption for all data in transit and at rest. We are not in the business of selling your data. We are in the business of helping you find better leads.',
      },
      {
        question: 'Do you scrape personal data?',
        answer: 'No. We only find business contact information that is publicly available on the internet. We do not scrape personal emails, personal phone numbers, or private information. Every contact we find is a business contact tied to a business entity. We verify it against the business mail server, not a personal one.',
      },
    ],
  },
  {
    title: 'Coverage',
    icon: <Globe className="w-5 h-5" />,
    questions: [
      {
        question: 'What countries does this work in?',
        answer: 'We cover 195+ countries. Our SMB Maps search works anywhere Google Maps works, which is basically everywhere on earth. Our Ads Intent search covers all major ad platforms globally. Social Intent monitors English-language posts from around the world. Web Absent works wherever businesses are listed online, which is everywhere. Some countries have more data available than others, but you will find something useful almost anywhere you search.',
      },
      {
        question: 'Does this work for B2B or B2C?',
        answer: 'Both, but we are built for B2B. Most of our users sell services to other businesses: web designers, marketers, accountants, consultants, agencies. Our search engines are tuned to find business decision makers, not random consumers. If you sell to businesses, this tool was built for you.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleQuestion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  // Filter questions based on search
  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => !searchQuery ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0)

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Back nav */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center mb-6">
            <HelpCircle className="w-7 h-7 text-[var(--color-accent)]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Questions People <span className="gradient-text">Actually Ask</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            Real answers. No corporate speak. No fluff. If your question is not here, email us at hello@baddecision.ai and we will answer it personally.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-12">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a question..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-10">
          {filteredCategories.map((category) => (
            <div key={category.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                  {category.icon}
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{category.title}</h2>
              </div>
              <div className="space-y-3">
                {category.questions.map((faq) => {
                  const id = `${category.title}-${faq.question}`
                  const isOpen = openIndex === id
                  return (
                    <motion.div
                      key={faq.question}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(id)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--bg-surface-hover)] transition-colors"
                      >
                        <span className="text-sm font-semibold text-[var(--text-primary)] pr-4">{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-[var(--text-tertiary)] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <motion.div
                        initial={false}
                        animate={{
                          height: isOpen ? 'auto' : 0,
                          opacity: isOpen ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{faq.answer}</p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)]">No questions match your search</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">Try different words or email us at hello@baddecision.ai</p>
          </div>
        )}

        {/* Still have questions */}
        <div className="mt-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 text-center">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Still have questions?</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            We are real people and we answer fast. Usually within an hour during business hours. Email us anytime.
          </p>
          <a
            href="mailto:hello@baddecision.ai"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all"
          >
            <Mail className="w-4 h-4" />
            hello@baddecision.ai
          </a>
        </div>

        {/* Quick links */}
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          <Link
            href="/#features"
            className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 hover:border-[var(--border-light)] transition-all group"
          >
            <Target className="w-6 h-6 text-[var(--color-orange)] mb-3" />
            <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-accent)] transition-colors">See How It Works</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Four ways to find your next customer</p>
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 hover:border-[var(--border-light)] transition-all group"
          >
            <Coins className="w-6 h-6 text-[var(--color-coin)] mb-3" />
            <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-accent)] transition-colors">See Pricing</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Start free, pay when you are ready</p>
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 hover:border-[var(--border-light)] transition-all group"
          >
            <CheckCircle2 className="w-6 h-6 text-[var(--color-green)] mb-3" />
            <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-accent)] transition-colors">Get Started Free</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">50 free coins, no credit card</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
