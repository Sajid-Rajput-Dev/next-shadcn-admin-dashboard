# Capitol Alpha — External Resources & Infrastructure Plan
### Prepared for Client Review | February 2026

---

> **Purpose of This Document**
>
> This document provides a comprehensive breakdown of every external service, API, and infrastructure resource required to build and deploy the Capitol Alpha MVP. Each resource has been evaluated against alternatives for **reliability, cost-efficiency, developer experience, and scalability**. The document separates development-phase (free) resources from production-phase (paid) resources, giving you full visibility into budget requirements.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Infrastructure Services](#2-infrastructure-services)
3. [Data Source APIs](#3-data-source-apis)
4. [Open-Source Libraries](#4-open-source-libraries-no-cost)
5. [Development Phase vs Production Phase](#5-development-phase-vs-production-phase)
6. [Budget Summary](#6-budget-summary)
7. [Resource Acquisition Checklist](#7-resource-acquisition-checklist)
8. [Risk Mitigation](#8-risk-mitigation)

---

## 1. Executive Summary

Capitol Alpha requires **5 external services** and **3 open-source libraries** to deliver the MVP. During the development phase, **all services operate on free tiers at $0/month**. For production launch, the estimated monthly cost is **$94.95 – $123.95/month** depending on the CoinGecko plan selected.

| Category | Service | Development Cost | Production Cost |
|----------|---------|-----------------|----------------|
| Hosting & Deployment | Vercel | $0 | $20/mo |
| Database & Auth | Supabase | $0 | $25/mo |
| Congressional Data + Stock Data | Financial Modeling Prep | $0 | $19/mo |
| Crypto Market Data | CoinGecko | $0 | $0 – $29/mo |
| Whale Transaction Tracking | Whale Alert | $0 | $29.95/mo |
| Financial Charts | TradingView Lightweight Charts | $0 | $0 (OSS) |
| **Total** | | **$0/mo** | **$93.95 – $123.95/mo** |

---

## 2. Infrastructure Services

### 2.1 Vercel — Hosting & Deployment Platform

| Attribute | Detail |
|-----------|--------|
| **Website** | [vercel.com](https://vercel.com) |
| **Purpose** | Hosts the Next.js application, provides CDN, serverless functions, and scheduled cron jobs |
| **Why Vercel** | First-party deployment platform for Next.js (built by the same team). Zero-config deployment, automatic CI/CD from Git, global edge network, built-in analytics |

#### Plan Comparison

| Feature | Hobby (Free) | Pro ($20/mo/member) |
|---------|:------------:|:-------------------:|
| Deployments per day | 100 | 6,000 |
| Serverless Functions | ✅ (basic) | ✅ (10x limits) |
| Cron Jobs | 100/project, **once/day only** | 100/project, **once/minute** |
| Bandwidth (Fast Data Transfer) | 100 GB | Included + $20 credit |
| Build Minutes | Basic | 10x |
| Analytics | Basic | Advanced |
| Custom Domains | ✅ | ✅ |
| SSL/HTTPS | ✅ | ✅ |
| Support | Community | Email |

#### Recommendation

| Phase | Plan | Cost | Rationale |
|-------|------|------|-----------|
| Development | **Hobby** | $0/mo | Sufficient for development and testing |
| Production | **Pro** | $20/mo | Required for per-minute cron jobs (data sync), higher build limits, and team collaboration |

> [!IMPORTANT]
> The Hobby plan limits cron jobs to **once per day**. Since Capitol Alpha requires syncing congress trades and whale data at 15-minute and 2-minute intervals respectively, the **Pro plan is mandatory for production**.

#### Why Not Alternatives?

| Alternative | Reason Rejected |
|-------------|----------------|
| AWS Amplify | No native Next.js App Router support; complex configuration |
| Netlify | Slower Next.js builds; limited serverless function features |
| Railway | No built-in CDN; would require additional configuration |
| Self-hosted (VPS) | Significant DevOps overhead; no auto-scaling; security burden |

---

### 2.2 Supabase — Database, Authentication & Realtime

| Attribute | Detail |
|-----------|--------|
| **Website** | [supabase.com](https://supabase.com) |
| **Purpose** | PostgreSQL database (stores congress trades, whale transactions, user data, watchlists), user authentication (email/password, OAuth), and realtime subscriptions for live alerts |
| **Why Supabase** | Fully managed PostgreSQL with built-in Auth, Realtime, and Row Level Security. Eliminates need for separate auth provider (Clerk, Auth0). Open-source. Generous free tier |

#### Plan Comparison

| Feature | Free | Pro ($25/mo) |
|---------|:----:|:------------:|
| Database Size | 500 MB | 8 GB |
| Monthly Active Users (Auth) | 50,000 | 100,000 |
| API Requests | Unlimited | Unlimited |
| Bandwidth (Egress) | 5 GB | 250 GB |
| File Storage | 1 GB | 100 GB |
| Realtime Connections | 200 concurrent | 500 concurrent |
| Realtime Messages | 2M/month | 5M/month |
| Daily Backups | ❌ | ✅ (7-day retention) |
| Log Retention | ❌ | 7 days |
| Inactivity Pause | After 1 week | Never |
| Support | Community | Email |

#### Recommendation

| Phase | Plan | Cost | Rationale |
|-------|------|------|-----------|
| Development | **Free** | $0/mo | 500 MB is sufficient for dev data; 50K MAU far exceeds dev needs |
| Production | **Pro** | $25/mo | Required: no inactivity pausing, daily backups, 8 GB database (congress trades table alone will exceed 500 MB at scale), email support |

> [!CAUTION]
> The Free plan **pauses the database after 1 week of inactivity**. This makes it **unsuitable for any production deployment** where uptime is required.

#### Why Not Alternatives?

| Alternative | Reason Rejected |
|-------------|----------------|
| Firebase (Firestore) | NoSQL — poor fit for relational congress trade data; complex pricing model |
| PlanetScale | MySQL-only; no built-in auth; no realtime |
| Neon | Good Postgres but no built-in auth/realtime — would require adding Clerk/Auth0 separately |
| MongoDB Atlas | NoSQL; no built-in auth; would add architectural complexity |
| AWS RDS + Cognito | Expensive; complex setup; significant DevOps overhead |

---

## 3. Data Source APIs

### 3.1 Financial Modeling Prep (FMP) — Congressional Trades & Stock Market Data

| Attribute | Detail |
|-----------|--------|
| **Website** | [financialmodelingprep.com](https://financialmodelingprep.com) |
| **Purpose** | Primary data source for US congressional stock trading disclosures (Senate + House), real-time stock quotes, market movers, sector performance, S&P 500 heatmap data, and company profiles |
| **Why FMP** | Only API that provides **both** congressional trading data AND stock market data from a single provider. Eliminates need for multiple stock data APIs |

#### Endpoints We Require

| Endpoint | Data Provided | MVP Use Case |
|----------|--------------|--------------|
| `/api/v4/senate-trading` | Senate member stock trades, amounts, dates | Congress trades table + alerts |
| `/api/v4/house-disclosure` | House member stock trades, amounts, dates | Congress trades table + alerts |
| `/api/v3/quote/{symbol}` | Real-time stock price, change, volume | Dashboard KPI cards |
| `/api/v3/stock_market/actives` | Most actively traded stocks | Dashboard top movers |
| `/api/v3/sectors-performance` | Sector performance data | Stock market heatmap |
| `/api/v3/profile/{symbol}` | Company name, sector, industry, logo | Ticker details + enrichment |

#### Plan Comparison

| Feature | Free | Starter ($19/mo annual) |
|---------|:----:|:-----------------------:|
| API Calls | 250/day | 750/min |
| Historical Data | 5 years | 15 years |
| Market Coverage | US only | US, UK, Canada |
| Rate Limit | ~3/min effective | 750/min |
| Congressional Data | ✅ | ✅ |
| Real-time Quotes | ✅ (delayed) | ✅ (real-time) |

#### Recommendation

| Phase | Plan | Cost | Rationale |
|-------|------|------|-----------|
| Development | **Free** | $0/mo | 250 calls/day is enough for dev/testing |
| Production | **Starter** | $19/mo | 750 calls/min handles production traffic; 15-year history enables richer analytics; real-time quotes |

> [!NOTE]
> FMP's free tier is **250 calls per day, not per minute**. At production scale, with dashboard refreshes + cron syncs + user requests, this will be exhausted within the first hour of operations. The **Starter plan is essential** for production.

#### Why Not Alternatives?

| Alternative | Reason Rejected |
|-------------|----------------|
| Capitol Trades API | No public API; scraping only — unreliable, may violate ToS |
| Quiver Quantitative | Congressional data only; no stock quotes — would need a second API |
| Alpha Vantage | No congressional data; 25 calls/day free tier is very restrictive |
| Finnhub | No congressional data; would require pairing with another provider |
| Yahoo Finance API | Unofficial; frequently breaks; no congressional data |

---

### 3.2 CoinGecko — Cryptocurrency Market Data

| Attribute | Detail |
|-----------|--------|
| **Website** | [coingecko.com/en/api](https://www.coingecko.com/en/api) |
| **Purpose** | Real-time cryptocurrency prices, market cap rankings, 24h volume, price charts, trending coins, and global crypto market statistics |
| **Why CoinGecko** | Industry standard for crypto data. Covers 18,000+ coins across 600+ categories. Most complete free tier among crypto data providers |

#### Endpoints We Require

| Endpoint | Data Provided | MVP Use Case |
|----------|--------------|--------------|
| `/api/v3/coins/markets` | Top coins by market cap with prices, volume, change | Dashboard crypto KPIs |
| `/api/v3/coins/{id}/market_chart` | Historical price data (1d, 7d, 30d) | Price sparklines |
| `/api/v3/search/trending` | Trending coins in last 24h | Dashboard trending section |
| `/api/v3/global` | Total market cap, BTC dominance, total volume | Global stats cards |
| `/api/v3/simple/price` | Current price for specific coins | Watchlist price display |

#### Plan Comparison

| Feature | Demo (Free) | Analyst ($129/mo) |
|---------|:-----------:|:-----------------:|
| Rate Limit | 30 calls/min | 500 calls/min |
| Monthly Calls | 10,000 | 500,000 |
| Historical Data | 1 year | 10 years |
| Endpoints | 50+ | 80+ |
| Support | None | FAQ |

#### Recommendation

| Phase | Plan | Cost | Rationale |
|-------|------|------|-----------|
| Development | **Demo (Free)** | $0/mo | 10K calls/month is adequate for development |
| Production (Initial) | **Demo (Free)** | $0/mo | With aggressive caching (1-5 min TTL) + DB storage of historical data, 10K calls/month can sustain early production with <500 DAU |
| Production (Growth) | **Analyst** | $129/mo | Required when DAU exceeds ~500 or if real-time crypto pricing is needed |

> [!TIP]
> **Cost optimization strategy:** By caching CoinGecko responses in Supabase and serving from cache, the free Demo plan can sustain early production. Budget the Analyst plan upgrade for when user growth demands it.

#### Why Not Alternatives?

| Alternative | Reason Rejected |
|-------------|----------------|
| CoinMarketCap API | More restrictive free tier (333 calls/day); less granular data |
| CryptoCompare | Free tier limited to 100K calls/month but fewer endpoints |
| Binance API | Exchange-specific; doesn't cover all coins; complex auth |
| Messari | Limited free tier; enterprise-focused pricing |

---

### 3.3 Whale Alert — Crypto Whale Transaction Tracking

| Attribute | Detail |
|-----------|--------|
| **Website** | [whale-alert.io](https://whale-alert.io) |
| **Purpose** | Real-time tracking of large cryptocurrency transactions across major blockchains. Identifies transfers between exchanges, whales, funds, and unknown wallets. **This is Capitol Alpha's primary differentiator** — no other platform in this space combines congressional tracking with whale alerts |
| **Why Whale Alert** | Industry leader in whale transaction tracking. Covers 11 blockchains, 100+ assets. Provides owner-type classification (exchange, whale, fund) which is critical for our buy/sell signal logic |

#### Data Fields We Require

| Field | Description | MVP Use Case |
|-------|-------------|--------------|
| `blockchain` | Which chain (Bitcoin, Ethereum, etc.) | Filter + display |
| `symbol` | Asset symbol (BTC, ETH, USDT, etc.) | Alert cards + tables |
| `amount` / `amount_usd` | Transaction size in token and USD | Severity classification |
| `from.owner_type` | Sender classification (exchange, whale, fund, unknown) | Buy/sell signal logic |
| `to.owner_type` | Receiver classification | Buy/sell signal logic |
| `timestamp` | Transaction time | Chronological feed |
| `transaction_hash` | On-chain tx hash | Verification link |

#### Plan Comparison

| Feature | Free | Personal ($29.95/mo) |
|---------|:----:|:--------------------:|
| API Calls | 10/min | 100/hr (WebSocket) |
| Min Transaction Size | $500,000 | Custom threshold |
| Alert Delivery | Delayed | Real-time |
| Historical Data | ❌ | ✅ (30 days) |
| Blockchains | 11 | 11 |
| Assets | 100+ | 100+ |
| Custom Alerts | ❌ | ✅ |
| WebSocket API | ❌ | ✅ |

#### Recommendation

| Phase | Plan | Cost | Rationale |
|-------|------|------|-----------|
| Development | **Free** | $0/mo | 10 calls/min is sufficient for development; $500K threshold still provides meaningful data |
| Production | **Personal** | $29.95/mo | Required for real-time delivery (free tier is delayed), custom alert thresholds, historical data for backtesting signals, and WebSocket support for live feeds |

> [!WARNING]
> The free tier has a **$500,000 minimum transaction threshold** and **delayed delivery**. For a production-quality whale tracking feature — which is our core differentiator — the Personal plan is non-negotiable.

#### Why Not Alternatives?

| Alternative | Reason Rejected |
|-------------|----------------|
| Nansen API | Enterprise pricing ($150+/mo); overkill for MVP |
| Glassnode | On-chain analytics focus, not transaction alerts; expensive |
| Etherscan/Blockchain.com APIs | Single-chain only; no whale classification; no cross-chain support |
| Custom on-chain monitoring | Would require running blockchain nodes; massive infrastructure cost; months of development |
| Lookonchain | No public API; social media alerts only |

---

## 4. Open-Source Libraries (No Cost)

These libraries are free, open-source, and have no licensing fees. They are included here for completeness and to confirm no hidden costs.

### 4.1 TradingView Lightweight Charts

| Attribute | Detail |
|-----------|--------|
| **Repository** | [github.com/tradingview/lightweight-charts](https://github.com/tradingview/lightweight-charts) |
| **License** | Apache 2.0 (free for commercial use) |
| **Purpose** | Interactive financial charts (candlestick, line, area, histogram) and market heatmap visualization on the dashboard |
| **Cost** | **$0 — forever** |
| **Stars** | 10K+ GitHub stars |
| **Maintained by** | TradingView (official) |

> [!NOTE]
> The Apache 2.0 license **requires** attribution to TradingView as the product creator on a public page. This is a display requirement, not a cost.

#### Why Not Alternatives?

| Alternative | Reason Rejected |
|-------------|----------------|
| TradingView Widget (embed) | Not customizable; loads TradingView branding; iframe-based |
| Highcharts | Commercial license required ($590+); not free for production |
| Chart.js | Not designed for financial data; no candlestick support |
| D3.js | Low-level; massive development effort to build financial charts |
| Recharts | Already in template for basic charts; not suited for financial time-series |

### 4.2 TanStack React Query

| Attribute | Detail |
|-----------|--------|
| **Package** | `@tanstack/react-query` |
| **License** | MIT (free for commercial use) |
| **Purpose** | Server state management — data fetching, caching, background refetch, pagination for all API calls |
| **Cost** | **$0 — forever** |

### 4.3 Zustand

| Attribute | Detail |
|-----------|--------|
| **Package** | `zustand` |
| **License** | MIT (free for commercial use) |
| **Purpose** | Client-side state management (market toggle, theme, notification queue) |
| **Cost** | **$0 — forever** |

---

## 5. Development Phase vs Production Phase

### 5.1 Development Phase (Weeks 1–4)

All resources operate on free tiers. **No payment required during development.**

| Resource | Plan | Cost | Limitation |
|----------|------|------|------------|
| Vercel | Hobby | $0 | Cron jobs run once/day only |
| Supabase | Free | $0 | DB pauses after 1 week inactivity; 500 MB |
| FMP API | Free | $0 | 250 calls/day |
| CoinGecko | Demo | $0 | 10K calls/month; 30/min |
| Whale Alert | Free | $0 | 10 calls/min; $500K min threshold |
| TradingView Charts | Apache 2.0 | $0 | — |
| **Total** | | **$0/month** | |

### 5.2 Production Phase (Post-Launch)

| Resource | Plan | Monthly Cost | Annual Cost | Key Upgrade Benefit |
|----------|------|:------------:|:-----------:|---------------------|
| Vercel | Pro | $20 | $240 | Per-minute cron jobs; 6K deploys/day |
| Supabase | Pro | $25 | $300 | 8 GB DB; daily backups; no pausing |
| FMP API | Starter | $19 | $228 | 750 calls/min; real-time quotes |
| CoinGecko | Demo (Free) | $0 | $0 | Cached aggressively — free sufficient initially |
| Whale Alert | Personal | $29.95 | $359.40 | Real-time alerts; WebSocket; custom thresholds |
| TradingView Charts | Apache 2.0 | $0 | $0 | — |
| **Total** | | **$93.95** | **$1,127.40** | |

### 5.3 Growth Phase (500+ DAU)

| Resource | Plan | Monthly Cost | Annual Cost | Upgrade Trigger |
|----------|------|:------------:|:-----------:|-----------------|
| Vercel | Pro | $20 | $240 | — |
| Supabase | Pro | $25 | $300 | Monitor DB size; upgrade compute if needed |
| FMP API | Starter | $19 | $228 | — |
| CoinGecko | Analyst | $129 | $1,548 | When 10K calls/month is exhausted |
| Whale Alert | Personal | $29.95 | $359.40 | — |
| TradingView Charts | Apache 2.0 | $0 | $0 | — |
| **Total** | | **$222.95** | **$2,675.40** | |

---

## 6. Budget Summary

```
┌──────────────────────────────────────────────────────────────┐
│                    MONTHLY COST OVERVIEW                      │
│                                                              │
│  Development Phase .......................... $0.00/month    │
│  Production Launch ......................... $93.95/month    │
│  Growth Phase (500+ DAU) .................. $222.95/month    │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  Annual Cost (Production) ............... $1,127.40/year     │
│  Annual Cost (Growth) .................. $2,675.40/year      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **All costs above are service subscription costs only.** They do not include domain registration (~$12/year), team member Vercel seats ($20/mo per additional member), or Supabase usage overages. These are variable and depend on your specific configuration.

---

## 7. Resource Acquisition Checklist

The following accounts and API keys must be created **before development begins**. All can be set up in a single session (estimated time: 30–45 minutes).

### 7.1 Immediate Setup (Free — Required for Day 1)

| # | Resource | Action | URL | Time |
|---|----------|--------|-----|------|
| 1 | **GitHub** | Create repository for the project | [github.com](https://github.com) | 5 min |
| 2 | **Vercel** | Sign up with GitHub; connect repo | [vercel.com/signup](https://vercel.com/signup) | 5 min |
| 3 | **Supabase** | Create account; create new project; save project URL + anon key + service role key | [supabase.com/dashboard](https://supabase.com/dashboard) | 10 min |
| 4 | **FMP** | Register for free API key | [financialmodelingprep.com/developer/docs](https://financialmodelingprep.com/developer/docs) | 5 min |
| 5 | **CoinGecko** | Create account; generate Demo API key | [coingecko.com/en/api/pricing](https://www.coingecko.com/en/api/pricing) | 5 min |
| 6 | **Whale Alert** | Sign up; obtain free API key | [whale-alert.io/signup](https://whale-alert.io/signup) | 5 min |

### 7.2 Pre-Launch Upgrades (Paid — Required Before Go-Live)

| # | Resource | Action | Cost | When |
|---|----------|--------|------|------|
| 1 | **Vercel** | Upgrade to Pro plan | $20/mo | Week 4 (before deploying cron schedules) |
| 2 | **Supabase** | Upgrade to Pro plan | $25/mo | Week 4 (before production deployment) |
| 3 | **FMP** | Upgrade to Starter (annual billing recommended) | $19/mo | Week 4 (before production deployment) |
| 4 | **Whale Alert** | Subscribe to Personal plan | $29.95/mo | Week 3 (for testing real-time whale alerts) |
| 5 | **Domain** | Register production domain (optional) | ~$12/year | Week 4 |

### 7.3 Environment Variables to Be Configured

Once all accounts are created, the following environment variables must be set in the project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Financial Modeling Prep
FMP_API_KEY=[your-fmp-api-key]

# CoinGecko
COINGECKO_API_KEY=[your-coingecko-demo-key]

# Whale Alert
WHALE_ALERT_API_KEY=[your-whale-alert-key]
```

---

## 8. Risk Mitigation

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| FMP API rate limit exceeded | Congress data stops updating | Database caching (sync every 15 min, serve from DB); upgrade to Starter ensures 750 calls/min |
| CoinGecko free tier exhausted | Crypto prices stop refreshing | Aggressive response caching (1-5 min TTL); store historical data in Supabase; upgrade to Analyst when needed |
| Whale Alert delayed alerts (free tier) | Whale alerts arrive late | Upgrade to Personal plan for real-time delivery; WebSocket for instant notifications |
| Supabase free DB pauses | Application goes offline | Upgrading to Pro plan eliminates inactivity-based pausing |
| Vercel Hobby cron limitation | Data syncs only once/day | Pro plan enables per-minute cron scheduling |
| API provider discontinuation | Data source disappears | Architecture uses abstraction layer; switching providers requires only API client changes, not UI rewrites |
| Unexpected traffic spike | Rate limits hit across all APIs | All API responses cached in Supabase; serve from DB when API limits are reached; implement circuit breaker pattern |

---

> **Document Version:** 1.0
> **Prepared:** February 12, 2026
> **Valid Until:** Pricing verified as of February 2026. API provider pricing may change; recommend re-verification before purchase.
> **Confidentiality:** Prepared for internal client review. Do not distribute externally.
