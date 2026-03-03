"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { BarChart3, Database, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MotionWrapper, staggerContainer } from "@/components/ui/motion-wrapper";

export default function ExternalLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-white/5 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-1">
              <span className="inline-block font-bold text-xl tracking-tight">
                <span className="text-foreground">Capitol</span> <span className="text-gradient-primary">Alpha</span>
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
              >
                Login
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                >
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="space-y-6 pt-12 pb-8 md:pt-20 md:pb-12 lg:py-32">
          {/* Subtle Background */}
          <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
            <div className="h-[500px] w-full max-w-7xl bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_50%)] opacity-[0.05] blur-[80px]" />
          </div>

          <div className="container relative z-10 flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <MotionWrapper delay={0.1}>
              <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-medium text-primary text-sm backdrop-blur-sm">
                <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-primary" />
                Live Market Data
              </div>
            </MotionWrapper>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
              <MotionWrapper>
                <h1 className="font-bold font-heading text-4xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Trade Like a{" "}
                  <span className="relative inline-block text-gradient-primary">
                    Congressman
                    <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-gradient-primary opacity-30" />
                  </span>
                </h1>
              </MotionWrapper>
              <MotionWrapper delay={0.2}>
                <p className="mx-auto max-w-[42rem] text-muted-foreground leading-normal sm:text-xl sm:leading-8">
                  Track real-time trading activity from US politicians and crypto whales. Get notified of market-moving
                  events before the news breaks.
                </p>
              </MotionWrapper>
            </motion.div>

            <MotionWrapper delay={0.4} className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-primary px-8 text-primary-foreground shadow-primary/25 shadow-xl transition-transform hover:scale-105 hover:bg-primary/90"
                >
                  Start Tracking Now
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/10 px-8 backdrop-blur-sm hover:bg-white/5"
                >
                  Existing Member?
                </Button>
              </Link>
            </MotionWrapper>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24">
          <MotionWrapper
            direction="up"
            className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3"
            delay={0.5}
          >
            {[
              {
                icon: BarChart3,
                title: "Real-Time Data",
                desc: "Live feeds of stock and crypto disclosures as they happen.",
              },
              {
                icon: Database,
                title: "Whale Alerts",
                desc: "Monitor massive crypto movements across multiple chains.",
              },
              {
                icon: Shield,
                title: "Secure Watchlists",
                desc: "Build your personalized tracking dashboard with bank-grade security.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card p-2 transition-colors duration-500 hover:border-primary/50"
              >
                <div className="flex h-[200px] flex-col justify-between rounded-xl bg-black/40 p-6 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </MotionWrapper>
        </section>
      </main>

      <footer className="border-white/10 border-t bg-black py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-muted-foreground text-sm leading-loose md:text-left">
            Built by Antigravity. The source code is available on{" "}
            <a
              href="https://github.com"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 transition-colors hover:text-primary"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
