"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ArrowRight, BarChart2, Globe, Lock, Shield, TrendingUp, Zap } from "lucide-react";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { fadeIn, MotionWrapper, staggerContainer } from "@/components/ui/motion-wrapper";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      title: "Real-Time Congress Trades",
      description: "Track every stock purchase and sale by US Representatives and Senators the moment it's filed.",
      header: (
        <img
          src="/features/congress.png"
          alt="Congress Trades"
          className="h-full w-full object-cover opacity-60 transition duration-700 ease-in-out group-hover/bento:scale-110 group-hover/bento:opacity-100"
        />
      ),
      icon: <Shield className="h-4 w-4 text-blue-400" />,
    },
    {
      title: "Whale Wallet Tracking",
      description: "Monitor high-net-worth crypto wallets and follow the smart money flow in real-time.",
      header: (
        <img
          src="/features/whale.png"
          alt="Whale Wallet Tracking"
          className="h-full w-full object-cover opacity-60 transition duration-700 ease-in-out group-hover/bento:scale-110 group-hover/bento:opacity-100"
        />
      ),
      icon: <Globe className="h-4 w-4 text-emerald-400" />,
    },
    {
      title: "Instant Alerts",
      description: "Get notified via Push, Email, or SMS whenever a significant trade occurs.",
      header: (
        <img
          src="/features/alerts.png"
          alt="Instant Alerts"
          className="h-full w-full object-cover opacity-60 transition duration-700 ease-in-out group-hover/bento:scale-110 group-hover/bento:opacity-100"
        />
      ),
      icon: <Zap className="h-4 w-4 text-orange-400" />,
    },
    {
      title: "Advanced Analytics",
      description: "Visualize trends, sector rotation, and politician performance with professional charts.",
      header: (
        <img
          src="/features/analytics.png"
          alt="Advanced Analytics"
          className="h-full w-full object-cover opacity-60 transition duration-700 ease-in-out group-hover/bento:scale-110 group-hover/bento:opacity-100"
        />
      ),
      icon: <BarChart2 className="h-4 w-4 text-pink-400" />,
    },
    {
      title: "Secure & Private",
      description: "Your data is encrypted and secure. We value your privacy as much as our alpha.",
      header: (
        <img
          src="/features/secure.png"
          alt="Secure & Private"
          className="h-full w-full object-cover opacity-60 transition duration-700 ease-in-out group-hover/bento:scale-110 group-hover/bento:opacity-100"
        />
      ),
      icon: <Lock className="h-4 w-4 text-cyan-400" />,
    },
    {
      title: "Market Sentiment",
      description: "Gauge the overall market sentiment based on insider activity and legislative moves.",
      header: (
        <img
          src="/features/sentiment.png"
          alt="Market Sentiment"
          className="h-full w-full object-cover opacity-60 transition duration-700 ease-in-out group-hover/bento:scale-110 group-hover/bento:opacity-100"
        />
      ),
      icon: <TrendingUp className="h-4 w-4 text-violet-400" />,
    },
  ];

  const testimonials = [
    {
      ticker: "NVDA",
      type: "BUY",
      amount: "$1.2M - $5M",
      person: "Nancy Pelosi",
      role: "House Rep",
    },
    {
      ticker: "MSFT",
      type: "SELL",
      amount: "$500K - $1M",
      person: "0xWhale...4a2b",
      role: "Smart Money",
    },
    {
      ticker: "MSTR",
      type: "BUY",
      amount: "$15K",
      person: "Michael Saylor",
      role: "Corp Treasury",
    },
    {
      ticker: "TSLA",
      type: "SELL",
      amount: "$250K - $500K",
      person: "Sen. Tuberville",
      role: "US Senate",
    },
    {
      ticker: "ETH",
      type: "BUY",
      amount: "$8.4M",
      person: "Vitalik Buterin",
      role: "Ethereum Fdn",
    },
    {
      ticker: "COIN",
      type: "BUY",
      amount: "$100K - $250K",
      person: "Cathie Wood",
      role: "Ark Invest",
    },
    {
      ticker: "GOOGL",
      type: "SELL",
      amount: "$1M - $2M",
      person: "Rep. Khanna",
      role: "House Rep",
    },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <header
        className={cn(
          "fixed top-0 z-50 w-full border-b transition-all duration-300",
          scrolled ? "border-white/5 bg-background/80 backdrop-blur-md" : "border-transparent bg-transparent",
        )}
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link className="flex items-center justify-center gap-2 font-bold text-xl tracking-tight" href="/">
            <span className="text-foreground">Capitol</span> <span className="text-gradient-primary">Alpha</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              className="font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
              href="/login"
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
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex h-[100vh] w-full flex-col items-center justify-center overflow-hidden">
          <Spotlight className="-top-40 md:-top-20 left-0 md:left-60" fill="white" />

          <MotionWrapper
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center md:px-6"
          >
            <MotionWrapper variants={fadeIn} className="mb-6">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-primary text-sm backdrop-blur-sm">
                <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-primary" />
                Powered by Gerla Crypto Whale Group
              </div>
            </MotionWrapper>

            <MotionWrapper variants={fadeIn}>
              <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text pb-4 font-bold text-5xl text-transparent tracking-tighter md:text-7xl">
                Trade Like a <br />
                <span className="glow-text text-gradient-primary">Congress Member</span>
              </h1>
            </MotionWrapper>

            <MotionWrapper
              variants={fadeIn}
              className="mb-8 max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              Access the same market intelligence as the most powerful people in Washington. Track real-time stock
              trades from Congress and crypto moves from whales.
            </MotionWrapper>

            <MotionWrapper variants={fadeIn} className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="hover:-translate-y-1 h-12 transform bg-primary px-8 text-base text-white shadow-[0_0_20px_rgba(25,150,211,0.3)] transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(25,150,211,0.5)]"
                asChild
              >
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/10 px-8 text-base backdrop-blur-sm transition-all duration-300 hover:bg-white/5 hover:text-white"
                asChild
              >
                <Link href="/data-explorer/trades">Explore Data</Link>
              </Button>
            </MotionWrapper>
          </MotionWrapper>

          {/* Background Gradients */}
          <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[1000px] rounded-full bg-primary/20 opacity-20 blur-[120px]" />

          {/* Infinite Ticker Section - Fixed at Bottom of Hero */}
          <div className="absolute bottom-4 left-0 z-20 w-full overflow-hidden border-white/5 border-y bg-black/20 backdrop-blur-sm md:bottom-8">
            <InfiniteMovingCards items={testimonials} direction="right" speed="normal" />
          </div>
        </section>

        {/* Features Grid */}
        <section className="relative z-10 w-full bg-black py-24">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-16 flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="font-bold text-3xl text-white tracking-tighter md:text-4xl">
                Institutional-Grade <span className="text-primary">Intelligence</span>
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Our platform aggregates data from thousands of sources to give you a clear picture of what the smart
                money is doing.
              </p>
            </div>

            <BentoGrid className="mx-auto max-w-6xl">
              {features.map((feature, i) => (
                <BentoGridItem
                  key={i}
                  title={feature.title}
                  description={feature.description}
                  header={feature.header}
                  icon={feature.icon}
                  className=""
                />
              ))}
            </BentoGrid>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-white/10 border-t bg-black py-12">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
          <p className="text-muted-foreground text-xs">© 2024 Capitol Alpha. All rights reserved.</p>
          <nav className="flex gap-6 text-muted-foreground text-xs">
            <Link href="#" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Twitter
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
