"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Database, Shield, TrendingUp } from "lucide-react";
import { MotionWrapper, staggerContainer } from "@/components/ui/motion-wrapper";
import { motion } from "framer-motion";

export default function ExternalLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-1">
              <span className="inline-block font-bold tracking-tight text-xl">
                <span className="text-foreground">Capitol</span> <span className="text-gradient-primary">Alpha</span>
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-4 py-2">
                Login
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="space-y-6 pb-8 pt-12 md:pb-12 md:pt-20 lg:py-32">
          {/* Subtle Background */}
          <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
             <div className="h-[500px] w-full max-w-7xl bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_50%)] opacity-[0.05] blur-[80px]" />
          </div>

          <div className="container relative z-10 flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <MotionWrapper delay={0.1}>
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                    Live Market Data
                </div>
            </MotionWrapper>

            <motion.div
               variants={staggerContainer}
               initial="hidden"
               animate="visible"
               className="space-y-4"
            >
                <MotionWrapper>
                    <h1 className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter">
                    Trade Like a <span className="text-gradient-primary relative inline-block">
                        Congressman
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-primary opacity-30 rounded-full"></span>
                    </span>
                    </h1>
                </MotionWrapper>
                <MotionWrapper delay={0.2}>
                    <p className="max-w-[42rem] mx-auto leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                    Track real-time trading activity from US politicians and crypto whales. 
                    Get notified of market-moving events before the news breaks.
                    </p>
                </MotionWrapper>
            </motion.div>
            
            <MotionWrapper delay={0.4} className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/signup">
                  <Button size="lg" className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/25 rounded-full transition-transform hover:scale-105">
                    Start Tracking Now
                  </Button>
              </Link>
              <Link href="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 border-white/10 hover:bg-white/5 rounded-full backdrop-blur-sm">
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
                    desc: "Live feeds of stock and crypto disclosures as they happen."
                },
                {
                    icon: Database,
                    title: "Whale Alerts",
                    desc: "Monitor massive crypto movements across multiple chains."
                },
                {
                    icon: Shield,
                    title: "Secure Watchlists",
                    desc: "Build your personalized tracking dashboard with bank-grade security."
                }
             ].map((feature, i) => (
                 <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card p-2 hover:border-primary/50 transition-colors duration-500">
                    <div className="flex h-[200px] flex-col justify-between rounded-xl bg-black/40 p-6 backdrop-blur-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                           <feature.icon className="h-6 w-6" />
                        </div>
                       <div className="space-y-2">
                          <h3 className="font-bold text-lg">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                       </div>
                    </div>
                 </div>
             ))}
          </MotionWrapper>
        </section>
      </main>
      
      <footer className="py-6 md:px-8 md:py-0 border-t border-white/10 bg-black">
         <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
               Built by Antigravity. The source code is available on <a href="#" className="font-medium underline underline-offset-4 hover:text-primary transition-colors">GitHub</a>.
            </p>
         </div>
      </footer>
    </div>
  );
}
