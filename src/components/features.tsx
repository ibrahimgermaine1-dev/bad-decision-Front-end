"use client";

import {
  Zap,
  Shield,
  Target,
  TrendingUp,
  BarChart3,
  Upload,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Verification",
    description:
      "Verify email addresses in real-time with sub-50ms response times. Our API checks syntax, domain, MX records, and mailbox existence in a single request, giving you instant confidence in every email you collect.",
  },
  {
    icon: Shield,
    title: "Deliverability Intelligence",
    description:
      "Go beyond simple valid/invalid checks. Our engine analyzes spam trap likelihood, disposable email detection, catch-all domain handling, and role-based account identification to give you a complete deliverability picture.",
  },
  {
    icon: Target,
    title: "Lead Scoring",
    description:
      "Automatically score every lead based on email quality, domain reputation, and engagement likelihood. Prioritize your outreach efforts on leads most likely to convert and stop wasting time on dead-end contacts.",
  },
  {
    icon: Upload,
    title: "Bulk CSV Upload",
    description:
      "Upload thousands of emails at once via CSV and get results back in minutes. Perfect for cleaning existing lists before a campaign. Download the verified results with detailed status codes and scores.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track verification trends, list health over time, and deliverability scores across your entire contact database. Visualize which sources produce the best leads and where your data quality is degrading.",
  },
  {
    icon: TrendingUp,
    title: "API Integration",
    description:
      "Drop our REST API into any workflow — signup forms, CRM pipelines, or marketing automation. Simple JSON responses with detailed verification results make integration a five-minute job.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Verify Emails
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From single email checks to bulk list cleaning, Bad Decision provides
            a complete email verification and intelligence platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
