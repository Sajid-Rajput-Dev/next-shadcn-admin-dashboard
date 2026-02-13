
"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    ticker: string;
    type: "BUY" | "SELL";
    amount: string;
    person: string;
    role: string;
  }[] | readonly {
    ticker: string;
    type: "BUY" | "SELL";
    amount: string;
    person: string;
    role: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "60s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "100s");
      }
    }
  };
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap",
          start && "animate-scroll ",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => {
          const isBuy = item.type === "BUY";
          return (
            <li
              className={cn(
                "relative flex-shrink-0 w-[280px] md:w-[350px] rounded-full border px-6 py-4 transition-all duration-300",
                "bg-black/40 backdrop-blur-md",
                isBuy 
                  ? "border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 group/card" 
                  : "border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5 group/card"
              )}
              key={`${item.ticker}-${idx}`}
            >
              <div className="flex items-center justify-between w-full">
                {/* Left Side: Ticker & Type */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-white tracking-tight">{item.ticker}</span>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1",
                      isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    )}>
                      {isBuy ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {item.type}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">{item.amount}</span>
                </div>

                {/* Right Side: Person */}
                <div className="flex flex-col items-end text-right gap-0.5">
                  <span className="text-sm font-semibold text-white/90 truncate max-w-[120px]">{item.person}</span>
                  <span className="text-xs text-muted-foreground/80 truncate max-w-[120px]">{item.role}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

