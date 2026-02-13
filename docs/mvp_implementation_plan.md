# Capitol Alpha — MVP Implementation Plan
## Minimum Viable Product: 4-Week Sprint

> **Goal:** Ship a functional product in 4 weeks that validates the core value proposition — "Track Congress trades AND Crypto whale moves in one dashboard."
> **Scope Rule:** If it's not in this document, it's NOT in the MVP.

---

## 1. MVP Feature Scope

### 1.1 What's IN the MVP ✅

| # | Feature | Priority | Effort |
|---|---------|----------|--------|
| 1 | Auth (Login / Signup / Logout) | P0 | 2 days |
| 2 | Dashboard with KPI cards | P0 | 3 days |
| 3 | Congress trade alert feed | P0 | 3 days |
| 4 | Whale transaction feed | P0 | 3 days |
| 5 | Market toggle (Stocks / Crypto / All) | P0 | 1 day |
| 6 | Stock market heatmap (TradingView) | P1 | 2 days |
| 7 | Congress trades data table | P1 | 2 days |
| 8 | Whale tracker data table | P1 | 2 days |
| 9 | Politician directory (card grid) | P1 | 1 day |
| 10 | Basic watchlist | P1 | 1 day |
| 11 | Settings (account + notification prefs) | P2 | 1 day |
| 12 | Landing page (simple) | P2 | 1 day |

**Total estimated effort: ~22 working days → 4 weeks with buffer**

### 1.2 What's OUT of the MVP ❌

| Feature | Reason | Planned For |
|---------|--------|-------------|
| Strategy dashboard + backtesting | Complex analytics, not core validation | Phase 2 |
| Crypto heatmap | Nice-to-have, stock heatmap validates the pattern | Phase 2 |
| Research desk / timeline | Content-heavy, needs editorial pipeline | Phase 2 |
| Portfolio manager (full) | Only watchlist in MVP | Phase 2 |
| Community hub | Social features need critical mass | Phase 3 |
| AI-powered insights | Requires trained models / prompt engineering | Phase 3 |
| Push notifications | Needs service worker setup | Phase 2 |
| Mobile app | Web-first, responsive design only | Phase 4 |
| Subscription / payments | Free MVP, monetize after validation | Phase 3 |

---

## 2. MVP Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────┐
│                 Next.js 16 (Vercel)                      │
│                                                           │
│  ┌──────────────┐  ┌──────────────────────────────────┐  │
│  │ Pages (RSC)   │  │ API Routes                       │  │
│  │               │  │                                  │  │
│  │ / (Landing)   │  │ /api/congress/trades   [FMP]     │  │
│  │ /login        │  │ /api/congress/alerts   [FMP]     │  │
│  │ /signup       │  │ /api/crypto/whales     [Whale]   │  │
│  │ /dashboard    │  │ /api/crypto/prices     [CGecko]  │  │
│  │ /alerts       │  │ /api/stocks/quotes     [FMP]     │  │
│  │ /trades       │  │ /api/stocks/heatmap    [FMP]     │  │
│  │ /whales       │  │ /api/watchlist         [Supa]    │  │
│  │ /politicians  │  │                                  │  │
│  │ /settings     │  │ /api/cron/sync-congress          │  │
│  │               │  │ /api/cron/sync-whales            │  │
│  └──────────────┘  └──────────────────────────────────┘  │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      │
          ┌───────────▼───────────┐
          │      Supabase         │
          │  PostgreSQL + Auth    │
          └───────────────────────┘
```

### 2.1 MVP Database Schema (Reduced)

Only these tables for MVP:

```sql
-- 1. Users (handled by Supabase Auth — only preferences table needed)
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    default_market TEXT DEFAULT 'both',
    alert_email BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Congress trades (synced from FMP)
CREATE TABLE congress_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_name TEXT NOT NULL,
    politician_party TEXT,
    politician_chamber TEXT,
    politician_state TEXT,
    ticker TEXT NOT NULL,
    company_name TEXT,
    transaction_type TEXT NOT NULL,
    amount_range TEXT,
    transaction_date DATE NOT NULL,
    disclosure_date DATE NOT NULL,
    sector TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mvp_trades_date ON congress_trades(disclosure_date DESC);
CREATE INDEX idx_mvp_trades_ticker ON congress_trades(ticker);

-- 3. Whale transactions (synced from Whale Alert)
CREATE TABLE whale_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blockchain TEXT NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    symbol TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    amount_usd NUMERIC NOT NULL,
    from_owner_type TEXT,
    to_owner_type TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mvp_whales_time ON whale_transactions(timestamp DESC);
CREATE INDEX idx_mvp_whales_symbol ON whale_transactions(symbol);

-- 4. Unified alerts view
CREATE VIEW alerts_feed AS
    SELECT
        id,
        'congress' AS source,
        politician_name AS actor,
        ticker AS symbol,
        transaction_type AS action,
        amount_range AS amount_display,
        disclosure_date AS event_time,
        CASE
            WHEN amount_range LIKE '%$1,000,001%' THEN 'critical'
            WHEN amount_range LIKE '%$250,001%' THEN 'high'
            WHEN amount_range LIKE '%$50,001%' THEN 'medium'
            ELSE 'low'
        END AS severity
    FROM congress_trades
    UNION ALL
    SELECT
        id,
        'whale' AS source,
        COALESCE(from_owner_type, 'unknown') AS actor,
        symbol,
        CASE
            WHEN to_owner_type = 'exchange' THEN 'Sell Signal'
            WHEN from_owner_type = 'exchange' THEN 'Buy Signal'
            ELSE 'Transfer'
        END AS action,
        '$' || ROUND(amount_usd / 1000000, 1) || 'M' AS amount_display,
        timestamp AS event_time,
        CASE
            WHEN amount_usd > 50000000 THEN 'critical'
            WHEN amount_usd > 10000000 THEN 'high'
            WHEN amount_usd > 1000000 THEN 'medium'
            ELSE 'low'
        END AS severity
    FROM whale_transactions
    ORDER BY event_time DESC;

-- 5. Watchlist
CREATE TABLE watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    ticker TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, ticker, asset_type)
);
```

---

## 3. MVP Sprint Plan (4 Weeks)

### Week 1: Foundation & Auth
**Goal:** App runs, user can login/signup, sidebar works, theme set.

| Day | Task | Files |
|-----|------|-------|
| Mon | Clone template, install deps, configure theme ("Midnight Gold") | `globals.css`, `tailwind.config.ts` |
| Tue | Set up Supabase project (auth + DB), create schema, run migrations | `lib/supabase/`, SQL migrations |
| Wed | Build login page (email/password) | `app/(auth)/login/` |
| Wed | Build signup page | `app/(auth)/signup/` |
| Thu | Configure auth middleware (protect dashboard routes) | `middleware.ts` |
| Thu | Customize sidebar navigation for our app | `components/layout/app-sidebar.tsx` |
| Fri | Set up API client wrappers (FMP, CoinGecko, Whale Alert) | `lib/api/fmp.ts`, `lib/api/coingecko.ts`, `lib/api/whale-alert.ts` |

**Deliverable:** User can sign up, log in, see empty dashboard with sidebar.

---

### Week 2: Data Pipeline & Dashboard
**Goal:** Dashboard shows live data — KPI cards, latest alert, recent trades.

| Day | Task | Files |
|-----|------|-------|
| Mon | Build API routes: `/api/congress/trades`, `/api/congress/alerts` | `app/api/congress/` |
| Mon | Build API routes: `/api/crypto/whales`, `/api/crypto/prices` | `app/api/crypto/` |
| Tue | Build cron job: sync congress trades (FMP → DB) | `app/api/cron/sync-congress/route.ts` |
| Tue | Build cron job: sync whale alerts (Whale Alert → DB) | `app/api/cron/sync-whales/route.ts` |
| Wed | Build dashboard KPI cards (Portfolio Value, P/L, Top Mover, Activity) | `app/(dashboard)/dashboard/_components/` |
| Wed | Build market toggle component (global) | `components/layout/market-toggle.tsx`, `stores/market-store.ts` |
| Thu | Build latest alert banner | `_components/latest-alert-card.tsx` |
| Thu | Build recent trades feed (unified congress + whale) | `_components/recent-trades.tsx` |
| Fri | Build TanStack Query hooks for all data | `hooks/use-congress-trades.ts`, `hooks/use-whale-transactions.ts`, etc. |

**Deliverable:** Dashboard shows real congress + whale data, market toggle works.

---

### Week 3: Data Tables & Heatmap
**Goal:** Users can explore congress trades, whale transactions, and see market heatmap.

| Day | Task | Files |
|-----|------|-------|
| Mon | Build congress trades table (TanStack Table + server pagination) | `app/(dashboard)/data-explorer/trades/` |
| Mon | Build trade filters (politician, party, ticker, date range) | `_components/trade-filters.tsx` |
| Tue | Build whale tracker table | `app/(dashboard)/data-explorer/whales/` |
| Tue | Build whale filters (blockchain, symbol, amount, owner type) | `_components/whale-filters.tsx` |
| Wed | Build politician directory (card grid with search) | `app/(dashboard)/data-explorer/politicians/` |
| Thu | Integrate TradingView Lightweight Charts for stock heatmap | `components/charts/stock-heatmap.tsx` |
| Thu | Add heatmap to dashboard page | Dashboard page update |
| Fri | Build stock quotes API route + integrate with dashboard cards | `app/api/stocks/quotes/route.ts` |

**Deliverable:** Full data exploration + interactive stock heatmap on dashboard.

---

### Week 4: Alerts, Watchlist, Settings & Polish
**Goal:** Complete alerts feed, basic watchlist, settings, polish, and deploy.

| Day | Task | Files |
|-----|------|-------|
| Mon | Build unified alerts feed page (infinite scroll) | `app/(dashboard)/alerts/` |
| Mon | Build alert card component with severity badges | `_components/alert-card.tsx` |
| Tue | Build alert filters (type, market, severity, search) | `_components/alert-filters.tsx` |
| Tue | Build basic watchlist (add/remove tickers) | `app/(dashboard)/portfolio/_components/watchlist.tsx` |
| Wed | Build settings page (account info, notification prefs) | `app/(dashboard)/settings/` |
| Wed | Build simple landing page | `app/page.tsx` |
| Thu | Polish: loading skeletons, error boundaries, empty states | Across all pages |
| Thu | Mobile responsive pass | All layouts |
| Fri | Deploy to Vercel, configure env vars, set up cron schedules | `vercel.json`, Vercel dashboard |
| Fri | Smoke test all features end-to-end | Manual testing |

**Deliverable:** MVP deployed and functional.

---

## 4. MVP Deliverables Checklist

### 4.1 Pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 1 | Landing Page | `/` | [ ] |
| 2 | Login | `/login` | [ ] |
| 3 | Signup | `/signup` | [ ] |
| 4 | Dashboard | `/dashboard` | [ ] |
| 5 | Alerts Feed | `/alerts` | [ ] |
| 6 | Congress Trades | `/data-explorer/trades` | [ ] |
| 7 | Whale Tracker | `/data-explorer/whales` | [ ] |
| 8 | Politicians Directory | `/data-explorer/politicians` | [ ] |
| 9 | Portfolio (Watchlist only) | `/portfolio` | [ ] |
| 10 | Settings | `/settings` | [ ] |

### 4.2 Components

| # | Component | Location | Status |
|---|-----------|----------|--------|
| 1 | App Sidebar (customized) | `components/layout/` | [ ] |
| 2 | Market Toggle | `components/layout/` | [ ] |
| 3 | KPI Summary Cards (4) | `dashboard/_components/` | [ ] |
| 4 | Latest Alert Banner | `dashboard/_components/` | [ ] |
| 5 | Recent Trades Feed | `dashboard/_components/` | [ ] |
| 6 | Stock Market Heatmap | `components/charts/` | [ ] |
| 7 | Congress Trades Table | `data-explorer/trades/` | [ ] |
| 8 | Whale Tracker Table | `data-explorer/whales/` | [ ] |
| 9 | Politician Card Grid | `data-explorer/politicians/` | [ ] |
| 10 | Alert Card | `alerts/_components/` | [ ] |
| 11 | Alert Filters | `alerts/_components/` | [ ] |
| 12 | Watchlist | `portfolio/_components/` | [ ] |
| 13 | Auth Forms (Login/Signup) | `(auth)/` | [ ] |
| 14 | Ticker Badge | `components/shared/` | [ ] |
| 15 | Party Badge | `components/shared/` | [ ] |
| 16 | Severity Badge | `components/shared/` | [ ] |
| 17 | Amount Badge | `components/shared/` | [ ] |
| 18 | Loading Skeletons | `components/shared/` | [ ] |

### 4.3 API Routes

| # | Route | Method | Source API | Cache TTL |
|---|-------|--------|-----------|-----------|
| 1 | `/api/congress/trades` | GET | FMP | 15 min |
| 2 | `/api/congress/alerts` | GET | DB | 5 min |
| 3 | `/api/crypto/whales` | GET | DB | 2 min |
| 4 | `/api/crypto/prices` | GET | CoinGecko | 1 min |
| 5 | `/api/stocks/quotes` | GET | FMP | 1 min |
| 6 | `/api/stocks/heatmap` | GET | FMP | 5 min |
| 7 | `/api/watchlist` | GET/POST/DELETE | DB | — |
| 8 | `/api/cron/sync-congress` | POST | FMP → DB | — |
| 9 | `/api/cron/sync-whales` | POST | Whale Alert → DB | — |

### 4.4 Data Hooks (TanStack Query)

| # | Hook | Refetch Interval |
|---|------|-----------------|
| 1 | `useCongressTrades(filters)` | 15 min |
| 2 | `useWhaleTransactions(filters)` | 2 min |
| 3 | `useStockQuotes(tickers[])` | 1 min |
| 4 | `useCryptoPrices(coinIds[])` | 1 min |
| 5 | `useAlertsFeed(filters)` | 30 sec |
| 6 | `useHeatmapData()` | 5 min |
| 7 | `useWatchlist()` | On-demand |
| 8 | `usePoliticians(search)` | 30 min |

### 4.5 Zustand Stores

| # | Store | Purpose |
|---|-------|---------|
| 1 | `marketStore` | Active market context (stocks/crypto/both) |
| 2 | `alertStore` | Toast notification queue |
| 3 | `themeStore` | Theme preferences (persisted) |

---

## 5. MVP Success Criteria

### 5.1 Functional Requirements (Must Pass)
- [ ] User can sign up with email and password
- [ ] User can log in and see the dashboard
- [ ] Dashboard shows 4 KPI cards with live data
- [ ] Dashboard shows the latest trade alert (congress or whale)
- [ ] Market toggle switches between Stocks / Crypto / All views
- [ ] Stock heatmap renders with real S&P 500 sector data
- [ ] Congress trades table loads with 43K+ rows (paginated)
- [ ] Whale tracker table shows recent large crypto transactions
- [ ] Politician directory shows card grid with names, parties, states
- [ ] Alert feed shows unified congress + whale alerts with severity badges
- [ ] Watchlist allows adding/removing tickers
- [ ] Settings page allows updating notification preferences
- [ ] Cron jobs successfully sync congress trades and whale data on schedule

### 5.2 Non-Functional Requirements (Must Pass)
- [ ] Page load < 3 seconds (dashboard)
- [ ] Mobile responsive (375px+)
- [ ] Dark theme applied consistently across all pages
- [ ] No console errors in production
- [ ] Auth protected routes redirect to login
- [ ] API routes handle errors gracefully (no 500s exposed to client)

### 5.3 Key Metrics to Track Post-Launch
- Daily Active Users (DAU)
- Alert feed views per session
- Time spent on dashboard
- Most viewed data table (Congress vs Whale)
- Watchlist additions per user
- Signup → Dashboard conversion rate

---

## 6. MVP Environment Setup Checklist

```bash
# 1. Clone the template
git clone https://github.com/arhamkhnz/next-shadcn-admin-dashboard.git capitol-alpha
cd capitol-alpha

# 2. Install dependencies
pnpm install

# 3. Add required packages
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add lightweight-charts
pnpm add @tanstack/react-query
pnpm add zustand

# 4. Create .env.local
cat > .env.local << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Financial Modeling Prep
FMP_API_KEY=your_fmp_api_key

# CoinGecko
COINGECKO_API_KEY=your_coingecko_demo_key

# Whale Alert
WHALE_ALERT_API_KEY=your_whale_alert_key
EOF

# 5. Run development server
pnpm dev
```

### API Key Acquisition (All Free Tier)

| API | Signup URL | Time to Get Key |
|-----|-----------|-----------------|
| FMP | https://financialmodelingprep.com/developer/docs | Instant |
| CoinGecko | https://www.coingecko.com/en/api/pricing | Instant |
| Whale Alert | https://whale-alert.io/signup | Instant |
| Supabase | https://supabase.com/dashboard | Instant |
| Vercel | https://vercel.com/signup | Instant |

---

## 7. Post-MVP Roadmap Preview

```
MVP (Weeks 1-4)          Phase 2 (Weeks 5-8)        Phase 3 (Weeks 9-12)
─────────────────        ────────────────────        ─────────────────────
✅ Auth                  📊 Strategy Dashboard       💬 Community Hub
✅ Dashboard             📊 Backtesting Engine        🤖 AI Insights
✅ Congress Alerts       🗺️ Crypto Heatmap            💰 Subscriptions
✅ Whale Alerts          📰 Research Desk             🔔 Push Notifications
✅ Data Tables           💼 Full Portfolio Manager     📱 PWA / Mobile
✅ Heatmap (Stocks)      📈 Price Charts (per ticker)  🏆 Leaderboards
✅ Watchlist             👤 Politician Profiles        📧 Email Alerts
✅ Settings              📊 Portfolio Analytics        🔗 Broker Integration
```

---

*This MVP plan is designed for AI agent-driven implementation. Each task is atomic, files are explicitly mapped, and dependencies are clear. An AI agent should be able to read this document and execute Week 1 Day 1 through Week 4 Day 5 sequentially.*
