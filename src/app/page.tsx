"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BarChart2, Shield, Zap, Globe, Lock, TrendingUp } from "lucide-react";
import { MotionWrapper, staggerContainer, fadeIn } from "@/components/ui/motion-wrapper";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
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
          className="w-full h-full object-cover opacity-60 group-hover/bento:opacity-100 group-hover/bento:scale-110 transition duration-700 ease-in-out"
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
          className="w-full h-full object-cover opacity-60 group-hover/bento:opacity-100 group-hover/bento:scale-110 transition duration-700 ease-in-out"
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
          className="w-full h-full object-cover opacity-60 group-hover/bento:opacity-100 group-hover/bento:scale-110 transition duration-700 ease-in-out"
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
          className="w-full h-full object-cover opacity-60 group-hover/bento:opacity-100 group-hover/bento:scale-110 transition duration-700 ease-in-out"
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
          className="w-full h-full object-cover opacity-60 group-hover/bento:opacity-100 group-hover/bento:scale-110 transition duration-700 ease-in-out"
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
          className="w-full h-full object-cover opacity-60 group-hover/bento:opacity-100 group-hover/bento:scale-110 transition duration-700 ease-in-out"
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
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <header 
        className={cn(
          "fixed top-0 z-50 w-full border-b transition-all duration-300",
          scrolled 
            ? "border-white/5 bg-background/80 backdrop-blur-md" 
            : "border-transparent bg-transparent"
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto max-w-7xl">
          <Link className="flex items-center justify-center font-bold gap-2 text-xl tracking-tight" href="/">
            <span className="text-foreground">Capitol</span> <span className="text-gradient-primary">Alpha</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" href="/login">
              Login
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex h-[100vh] w-full flex-col items-center justify-center overflow-hidden">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
          
          <MotionWrapper 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto"
          >
             <MotionWrapper variants={fadeIn} className="mb-6">
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-primary backdrop-blur-sm">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                  Powered by Gerla Crypto Whale Group
                </div>
             </MotionWrapper>

             <MotionWrapper variants={fadeIn}>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 pb-4">
                Trade Like a <br />
                <span className="text-gradient-primary glow-text">Congress Member</span>
              </h1>
             </MotionWrapper>

             <MotionWrapper variants={fadeIn} className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-8">
               Access the same market intelligence as the most powerful people in Washington. 
               Track real-time stock trades from Congress and crypto moves from whales.
             </MotionWrapper>

             <MotionWrapper variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
               <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(25,150,211,0.3)] hover:shadow-[0_0_30px_rgba(25,150,211,0.5)] transition-all duration-300 transform hover:-translate-y-1" asChild>
                 <Link href="/signup">
                   Get Started <ArrowRight className="ml-2 h-4 w-4" />
                 </Link>
               </Button>
               <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/10 hover:bg-white/5 hover:text-white backdrop-blur-sm transition-all duration-300" asChild>
                 <Link href="/data-explorer/trades">
                   Explore Data
                 </Link>
               </Button>
             </MotionWrapper>
          </MotionWrapper>
          
          {/* Background Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-20" />

          {/* Infinite Ticker Section - Fixed at Bottom of Hero */}
          <div className="absolute bottom-4 md:bottom-8 left-0 w-full z-20 overflow-hidden border-y border-white/5 bg-black/20 backdrop-blur-sm">
             <InfiniteMovingCards items={testimonials} direction="right" speed="normal" />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 relative z-10 w-full bg-black">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
                Institutional-Grade <span className="text-primary">Intelligence</span>
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Our platform aggregates data from thousands of sources to give you a clear picture of what the smart money is doing.
              </p>
            </div>
            
            <BentoGrid className="max-w-6xl mx-auto">
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
      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl">
          <p className="text-xs text-muted-foreground">
            © 2024 Capitol Alpha. All rights reserved.
          </p>
          <nav className="flex gap-6 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
