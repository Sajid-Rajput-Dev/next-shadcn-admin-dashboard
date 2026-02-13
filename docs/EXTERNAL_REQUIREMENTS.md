# External Requirements Checklist

To make **Capitol Alpha** fully functional, follow this checklist to configure external services, environment variables, and database tables.

---

## 1. Environment Variables (.env.local)

Create a `.env.local` file in the root directory (if not already present) and populate these values:

```env
# -----------------------------------------------------------------------------
# Supabase Configuration
# Create a new project at https://supabase.com/dashboard/projects
#
# To find your keys:
# 1. Go to your Supabase Project Dashboard
# 2. Click on "Project Settings" (icon at the bottom of the left sidebar)
# 3. Click on "API" in the list
# 4. Under "Project API keys", you will find:
#    - anon public (NEXT_PUBLIC_SUPABASE_ANON_KEY)
#    - service_role (SUPABASE_SERVICE_ROLE_KEY) - Reveal to copy
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" 

# Note: The Service Role Key is required for API routes (like cron jobs) 
# that need to bypass Row Level Security to write data.

# -----------------------------------------------------------------------------
# Financial Data APIs
# -----------------------------------------------------------------------------

# Financial Modeling Prep (FMP) - Stocks & Senate Trading Data
# Sign up: https://financialmodelingprep.com/developer/docs (Free Tier available)
FMP_API_KEY="your-fmp-api-key"

# CoinGecko - Crypto Prices
# Sign up: https://www.coingecko.com/en/api (Free Demo Tier)
COINGECKO_API_KEY="your-coingecko-api-key"

# Whale Alert - Large Crypto Transactions
# Sign up: https://whale-alert.io/ (Free Tier)
#
# To get your key:
# 1. Go to https://whale-alert.io/ and create an account.
# 2. Log in and go to your profile/dashboard.
# 3. Request an API key (the "Free" plan is sufficient for testing).
# 4. Copy the key displayed in your dashboard.
WHALE_ALERT_API_KEY="your-whale-alert-api-key"

# -----------------------------------------------------------------------------
# App Secrets
# -----------------------------------------------------------------------------

# Secret key to secure your cron job endpoints
CRON_SECRET="generate-a-random-string-here"
```

---

## 2. Database Setup (Supabase)

You need to create the tables and secure them. Go to the **SQL Editor** in your Supabase dashboard and run the following script. 
Alternatively, use the file located at `supabase/schema.sql`.

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. User Preferences Table
create table public.user_preferences (
  user_id uuid references auth.users not null primary key,
  theme_mode text default 'system',
  market_context text default 'all',
  email_notifications boolean default true,
  push_notifications boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Congress Trades Table
create table public.congress_trades (
  id uuid default uuid_generate_v4() primary key,
  ticker text not null,
  politician text not null,
  party text,
  chamber text, -- 'Senate' or 'House'
  trade_issuer text,
  publication_date date,
  transaction_date date,
  owner_type text,
  transaction_type text, -- 'Purchase' or 'Sale'
  amount_range text,
  price numeric,
  report_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  unique(politician, ticker, transaction_date, transaction_type, amount_range)
);

-- 3. Whale Transactions Table
create table public.whale_transactions (
  id uuid default uuid_generate_v4() primary key,
  blockchain text not null,
  symbol text not null,
  transaction_type text not null, -- 'transfer', 'mint', 'burn'
  amount numeric not null,
  amount_usd numeric,
  from_address text,
  to_address text,
  from_owner_type text,
  to_owner_type text,
  timestamp timestamp with time zone not null,
  hash text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Watchlist Items Table
create table public.watchlist_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  ticker text not null,
  asset_type text not null, -- 'stock' or 'crypto'
  name text,
  added_at timestamp with time zone default timezone('utc'::text, now()),
  
  unique(user_id, ticker, asset_type)
);

-- 5. Unified Alerts View
create or replace view public.alerts_feed as
select
  id::text,
  'congress' as source,
  politician as actor,
  ticker as symbol,
  transaction_type as action,
  amount_range as amount_display,
  publication_date as event_time,
  case 
    when transaction_type ilike '%purchase%' and amount_range ilike '%$50,001%' then 'high'
    when transaction_type ilike '%sale%' and amount_range ilike '%$50,001%' then 'medium'
    else 'low'
  end as severity
from public.congress_trades
union all
select
  id::text,
  'whale' as source,
  'Unknown Whale' as actor,
  symbol,
  transaction_type as action,
  '$' || to_char(amount_usd, 'FM999,999,999') as amount_display,
  timestamp as event_time,
  case 
    when amount_usd > 10000000 then 'critical'
    when amount_usd > 1000000 then 'high'
    else 'medium'
  end as severity
from public.whale_transactions;

-- Enable Row Level Security (RLS)
alter table public.user_preferences enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.congress_trades enable row level security;
alter table public.whale_transactions enable row level security;

-- Policies

-- User Preferences: Users can read/update their own data
create policy "Users can view own preferences" on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can update own preferences" on public.user_preferences
  for update using (auth.uid() = user_id);

create policy "Users can insert own preferences" on public.user_preferences
  for insert with check (auth.uid() = user_id);

-- Watchlist: Users can full CRUD their own watchlist
create policy "Users can view own watchlist" on public.watchlist_items
  for select using (auth.uid() = user_id);

create policy "Users can insert into own watchlist" on public.watchlist_items
  for insert with check (auth.uid() = user_id);

create policy "Users can delete from own watchlist" on public.watchlist_items
  for delete using (auth.uid() = user_id);

-- Public Data: Authenticated users can read congress and whale data
create policy "Authenticated users can view congress trades" on public.congress_trades
  for select to authenticated using (true);

create policy "Authenticated users can view whale transactions" on public.whale_transactions
  for select to authenticated using (true);
```

---

## 3. Cron Jobs Setup (Vercel)

For automatic data updates, deploy the project to Vercel. The `vercel.json` file is already configured with cron jobs.

Once deployed:
1.  Go to your project settings in Vercel.
2.  Navigate to **Settings > Cron Jobs**.
3.  You should see two jobs listed:
    *   `/api/cron/sync-congress` (runs daily at 10:00 UTC)
    *   `/api/cron/sync-whales` (runs every 10 minutes)

**Note:** For cron jobs to work, ensure the `CRON_SECRET` environment variable is set in Vercel.

---

## 4. Verification

After completing these steps:
1.  **Restart your local server** (`pnpm dev`).
2.  **Log in** to the app.
3.  Check the **Dashboard** and **Filters** to see if live data is loading (if APIs are correctly connected). 
4.  Test adding a ticker to your **Watchlist**.
