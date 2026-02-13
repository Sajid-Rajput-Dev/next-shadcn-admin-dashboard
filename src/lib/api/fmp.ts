import { API_URLS } from "@/lib/utils/constants";

const FMP_STABLE = API_URLS.FMP_STABLE;

function getApiKey(): string {
    const key = process.env.FMP_API_KEY;
    if (!key) throw new Error("FMP_API_KEY is not set");
    return key;
}

// ─── Response Types (Stable API) ──────────────────────────────

/** /stable/senate-latest & /stable/senate-trades response item */
interface FMPSenateTrade {
    symbol: string;
    disclosureDate: string;
    transactionDate: string;
    firstName: string;
    lastName: string;
    office: string;
    district: string;
    owner: string;
    assetDescription: string;
    assetType: string;
    type: string;
    amount: string;
    capitalGainsOver200USD?: string;
    comment: string;
    link: string;
    // Aliases kept for backward compatibility with internal code
    ticker?: string;
    dateRecieved?: string;
    party?: string;
    state?: string;
}

/** /stable/house-latest response item */
interface FMPHouseDisclosure {
    symbol: string;
    disclosureDate: string;
    transactionDate: string;
    firstName: string;
    lastName: string;
    office: string;
    district: string;
    owner: string;
    assetDescription: string;
    assetType: string;
    type: string;
    amount: string;
    capitalGainsOver200USD: string;
    comment: string;
    link: string;
    // Aliases for backward compat
    ticker?: string;
    representative?: string;
    party?: string;
    state?: string;
    disclosure_date?: string;
}

/** /stable/quote response item */
interface FMPQuote {
    symbol: string;
    name: string;
    price: number;
    changePercentage: number;  // Note: stable API uses "changePercentage" not "changesPercentage"
    changesPercentage?: number; // Keep alias for backward compat
    change: number;
    dayLow: number;
    dayHigh: number;
    yearHigh: number;
    yearLow: number;
    marketCap: number;
    priceAvg50: number;
    priceAvg200: number;
    exchange: string;
    volume: number;
    avgVolume?: number;
    open: number;
    previousClose: number;
    eps?: number;
    pe?: number;
    earningsAnnouncement?: string;
    sharesOutstanding?: number;
    timestamp: number;
}

/** /stable/sector-performance-snapshot response item */
interface FMPSectorPerformance {
    date: string;
    sector: string;
    exchange: string;
    averageChange: number;
    // Backward compat alias
    changesPercentage?: string;
}

/** /stable/profile response item */
interface FMPCompanyProfile {
    symbol: string;
    companyName: string;
    industry: string;
    sector: string;
    description: string;
    image: string;
    mktCap: number;
    ceo?: string;
    country?: string;
    ipoDate?: string;
}

// ─── Fetch Helper ─────────────────────────────────────────────

async function fmpFetch<T>(url: string): Promise<T> {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`FMP API error: ${response.status} ${response.statusText} — ${body.slice(0, 200)}`);
    }
    return response.json() as Promise<T>;
}

// ─── Client ───────────────────────────────────────────────────

/** Financial Modeling Prep API client (using /stable/ endpoints) */
export const fmpClient = {
    /**
     * Get latest Senate trading disclosures.
     * Free plan: ✅ Available
     * Endpoint: /stable/senate-latest?page=N&limit=N
     */
    async getSenateTrades(page = 0, limit = 25): Promise<FMPSenateTrade[]> {
        const trades = await fmpFetch<FMPSenateTrade[]>(
            `${FMP_STABLE}/senate-latest?page=${page}&limit=${limit}&apikey=${getApiKey()}`,
        );
        // Add backward-compat aliases
        return trades.map((t) => ({
            ...t,
            ticker: t.symbol,
            dateRecieved: t.disclosureDate,
            state: t.district,
        }));
    },

    /**
     * Get latest House trading disclosures.
     * Free plan: ✅ Available
     * Endpoint: /stable/house-latest?page=N&limit=N
     */
    async getHouseDisclosures(page = 0, limit = 25): Promise<FMPHouseDisclosure[]> {
        const trades = await fmpFetch<FMPHouseDisclosure[]>(
            `${FMP_STABLE}/house-latest?page=${page}&limit=${limit}&apikey=${getApiKey()}`,
        );
        // Add backward-compat aliases
        return trades.map((t) => ({
            ...t,
            ticker: t.symbol,
            representative: `${t.firstName} ${t.lastName}`,
            state: t.district,
            disclosure_date: t.disclosureDate,
        }));
    },

    /**
     * Get real-time stock quote.
     * Free plan: ✅ Available
     * Endpoint: /stable/quote?symbol=AAPL
     */
    async getQuote(symbols: string | string[]): Promise<FMPQuote[]> {
        const syms = Array.isArray(symbols) ? symbols.join(",") : symbols;
        const quotes = await fmpFetch<FMPQuote[]>(
            `${FMP_STABLE}/quote?symbol=${syms}&apikey=${getApiKey()}`,
        );
        // Add backward-compat alias
        return quotes.map((q) => ({
            ...q,
            changesPercentage: q.changePercentage ?? q.changesPercentage,
        }));
    },

    /**
     * Get sector performance snapshot for heatmap.
     * Free plan: ✅ Available
     * Endpoint: /stable/sector-performance-snapshot?date=YYYY-MM-DD
     * Note: requires a date parameter. Defaults to today.
     */
    async getSectorPerformance(date?: string): Promise<FMPSectorPerformance[]> {
        const d = date || new Date().toISOString().split("T")[0];
        const data = await fmpFetch<FMPSectorPerformance[]>(
            `${FMP_STABLE}/sector-performance-snapshot?date=${d}&apikey=${getApiKey()}`,
        );
        // Add backward-compat alias and deduplicate by sector (API returns per-exchange)
        const sectorMap = new Map<string, { sector: string; totalChange: number; count: number }>();
        for (const item of data) {
            const existing = sectorMap.get(item.sector);
            if (existing) {
                existing.totalChange += item.averageChange;
                existing.count += 1;
            } else {
                sectorMap.set(item.sector, { sector: item.sector, totalChange: item.averageChange, count: 1 });
            }
        }
        return Array.from(sectorMap.values()).map((s) => ({
            date: d,
            sector: s.sector,
            exchange: "ALL",
            averageChange: s.totalChange / s.count,
            changesPercentage: (s.totalChange / s.count).toFixed(4) + "%",
        }));
    },

    /**
     * Get company profile.
     * Free plan: ✅ Available
     * Endpoint: /stable/profile?symbol=AAPL
     */
    async getProfile(symbol: string): Promise<FMPCompanyProfile[]> {
        return fmpFetch<FMPCompanyProfile[]>(
            `${FMP_STABLE}/profile?symbol=${symbol}&apikey=${getApiKey()}`,
        );
    },
};

export type { FMPSenateTrade, FMPHouseDisclosure, FMPQuote, FMPSectorPerformance, FMPCompanyProfile };
