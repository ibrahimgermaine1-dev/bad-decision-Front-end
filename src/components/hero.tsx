"use client";

import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Zap, Shield, ArrowRight } from "lucide-react";

export function Hero() {
  const { user, login } = useAuthStore();

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-purple-600/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent" />

      <div className="container relative mx-auto px-4 max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-sm text-violet-600 mb-8">
          <Zap className="h-4 w-4" />
          <span>Real-time email verification</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
          Stop Guessing.
          <br />
          <span className="text-primary">Start Verifying.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Bad Decision gives you real-time email verification, lead scoring, and
          deliverability intelligence — so every email you send actually lands.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Button size="lg" asChild>
              <a href="#dashboard">
                <Shield className="h-5 w-5 mr-2" />
                Go to Dashboard
              </a>
            </Button>
          ) : (
            <Button size="lg" onClick={login}>
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          )}
          <Button variant="outline" size="lg" asChild>
            <a href="#features">See How It Works</a>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div>
            <div className="text-2xl font-bold text-primary">99.5%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">50ms</div>
            <div className="text-sm text-muted-foreground">Avg Response</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">10M+</div>
            <div className="text-sm text-muted-foreground">Emails Verified</div>
          </div>
        </div>
      </div>
    </section>
  );
}
