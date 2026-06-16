'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="bg-[#08080C]">
      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 mb-6">
            <span className="text-[12px] text-[#7C5CFC] font-semibold uppercase tracking-wider">Contact Us</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#F5F5F7] mb-6 leading-tight">
            Have a question? <br /><span className="text-gradient-violet">We answer fast.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#A8A8B8] max-w-2xl mx-auto leading-relaxed">
            You can email us directly. You can fill out the form below.
            Either way, a real person will read your message and reply. Usually within a few hours.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="card-premium p-8">
              <div className="w-12 h-12 rounded-xl bg-[#1A1535] flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-2">Email Us</h3>
              <p className="text-[14px] text-[#A8A8B8] mb-4">
                The fastest way to reach us. A real person reads every email.
              </p>
              <a href="mailto:support@baddecision.ai" className="text-[#7C5CFC] hover:text-[#6B4CE6] font-semibold text-[15px]">
                support@baddecision.ai
              </a>
            </div>

            <div className="card-premium p-8">
              <div className="w-12 h-12 rounded-xl bg-[#1A1535] flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-2">Already a member?</h3>
              <p className="text-[14px] text-[#A8A8B8] mb-4">
                Sign in and use the support tab inside your dashboard.
                You get priority response on all questions.
              </p>
              <a href="/sign-in" className="text-[#7C5CFC] hover:text-[#6B4CE6] font-semibold text-[15px]">
                Go to dashboard →
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="card-premium p-8 sm:p-10">
            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0D2818] border border-[#34D399]/30 mb-6">
                  <svg className="w-8 h-8 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#F5F5F7] mb-3">Message sent.</h3>
                <p className="text-[#A8A8B8]">
                  We will get back to you within a few hours. Check your inbox.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-[#F5F5F7] mb-2">Send us a message.</h3>
                <p className="text-[14px] text-[#A8A8B8] mb-6">Fill this out and we will reply by email.</p>
                <form
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
                  className="space-y-5"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-medium text-[#A8A8B8] mb-2">Your name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[#08080C] border border-[#25252F] focus:border-[#7C5CFC] text-[#F5F5F7] text-[15px] outline-none transition-colors"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#A8A8B8] mb-2">Your email</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[#08080C] border border-[#25252F] focus:border-[#7C5CFC] text-[#F5F5F7] text-[15px] outline-none transition-colors"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#A8A8B8] mb-2">What do you need help with?</label>
                    <select
                      className="w-full px-4 py-3 rounded-lg bg-[#08080C] border border-[#25252F] focus:border-[#7C5CFC] text-[#F5F5F7] text-[15px] outline-none transition-colors"
                    >
                      <option>I have a question about pricing</option>
                      <option>I need help with my account</option>
                      <option>A search did not work right</option>
                      <option>I want to talk about a big order</option>
                      <option>Something else</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#A8A8B8] mb-2">Your message</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg bg-[#08080C] border border-[#25252F] focus:border-[#7C5CFC] text-[#F5F5F7] text-[15px] outline-none transition-colors resize-none"
                      placeholder="Tell us what is going on..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white text-[15px] font-semibold transition-colors shadow-lg shadow-[#7C5CFC]/20"
                  >
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
