'use client'

/**
 * Premium Footer — Dark, comprehensive, multi-column.
 */
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <div>
                <span className="font-bold text-[15px] text-card-foreground tracking-tight">Bad Decision</span>
                <span className="block text-[10px] text-muted-foreground -mt-0.5 tracking-wide uppercase">Lead Intelligence</span>
              </div>
            </Link>
            <p className="text-[14px] text-muted-foreground leading-relaxed max-w-sm">
              We find real buyers who want what you sell. Every email gets tested before you pay a dime. No more ghost lists. No more wasted money.
            </p>
            <p className="mt-6 text-[13px] text-muted-foreground">
              Built for closers. Trusted by agencies worldwide.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-[12px] font-semibold text-card-foreground uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/how-it-works" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/case-studies" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">Results</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-[12px] font-semibold text-card-foreground uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/guarantee" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">Our Guarantee</Link></li>
              <li><Link href="/faq" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-[12px] font-semibold text-card-foreground uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="text-[14px] text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-muted-foreground">
            © 2026 Bad Decision. All rights reserved.
          </p>
          <p className="text-[13px] text-muted-foreground">
            Made for people who are tired of buying garbage leads.
          </p>
        </div>
      </div>
    </footer>
  )
}
