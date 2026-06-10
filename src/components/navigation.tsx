'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crosshair,
  Coins,
  LayoutDashboard,
  Menu,
  X,
  Zap,
  HelpCircle,
  User,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { NavAuthAware } from '@/components/nav-auth-aware'

export function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isDashboard = pathname?.startsWith('/dashboard')

  // Dashboard has its own sidebar — hide top nav on dashboard pages
  if (isDashboard) return null

  return (
    <NavAuthAware>
      {({ isSignedIn, coinBalance }) => (
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 right-0 z-50 glass"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-purple)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Crosshair className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-[var(--text-primary)] tracking-tight">
                  Bad Decision
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/#features">Features</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/faq" icon={<HelpCircle className="w-4 h-4" />}>FAQ</NavLink>
                {/* Only show Dashboard link when signed in */}
                {isSignedIn && (
                  <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</NavLink>
                )}
              </div>

              {/* Right section */}
              <div className="flex items-center gap-3">
                <ThemeToggle />

                <div className="flex items-center gap-2">
                  {isSignedIn ? (
                    <>
                      {/* Coin Balance */}
                      <Link href="/pricing" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--color-accent)] transition-colors">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                          <Coins className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-[var(--color-coin)]">{coinBalance}</span>
                      </Link>

                      {/* Dashboard button */}
                      <Link
                        href="/dashboard"
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] hover:opacity-90 transition-opacity"
                      >
                        Dashboard
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/sign-in"
                        className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/sign-up"
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] hover:opacity-90 transition-opacity"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden glass-light border-t border-[var(--border-color)]"
              >
                <div className="px-4 py-3 space-y-1">
                  <MobileNavLink href="/#features" onClick={() => setMobileOpen(false)}>Features</MobileNavLink>
                  <MobileNavLink href="/pricing" onClick={() => setMobileOpen(false)}>Pricing</MobileNavLink>
                  <MobileNavLink href="/faq" icon={<HelpCircle className="w-4 h-4" />} onClick={() => setMobileOpen(false)}>FAQ</MobileNavLink>
                  {/* Only show Dashboard in mobile menu when signed in */}
                  {isSignedIn && (
                    <MobileNavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} onClick={() => setMobileOpen(false)}>Dashboard</MobileNavLink>
                  )}
                  <div className="border-t border-[var(--border-color)] my-2" />
                  {isSignedIn ? (
                    <MobileNavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} onClick={() => setMobileOpen(false)}>
                      Go to Dashboard
                    </MobileNavLink>
                  ) : (
                    <>
                      <MobileNavLink href="/sign-in" icon={<User className="w-4 h-4" />} onClick={() => setMobileOpen(false)}>Sign In</MobileNavLink>
                      <MobileNavLink href="/sign-up" icon={<Zap className="w-4 h-4" />} onClick={() => setMobileOpen(false)}>Get Started Free</MobileNavLink>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </NavAuthAware>
  )
}

function NavLink({ href, icon, children }: { href: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface)] transition-all"
    >
      {icon}
      {children}
    </Link>
  )
}

function MobileNavLink({ href, icon, onClick, children }: { href: string; icon?: React.ReactNode; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface)] transition-all"
    >
      {icon}
      {children}
    </Link>
  )
}
