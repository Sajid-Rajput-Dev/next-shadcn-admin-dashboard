import { API_URLS } from "@/lib/utils/constants";

const FMP_STABLE = API_URLS.FMP_STABLE;

function getApiKey(): string {
    const key = process.env.FMP_API_KEY;
    if (!key) throw new Error("FMP_API_KEY is not set");
    return key;
}

// ─── New Response Types ────────────────────────────────────────

/** /stable/news?type=general|stock|crypto|forex response item */
export interface FMPNewsArticle {
    publishedDate: string;
    publisher: string;
    title: string;
    image: string;
    site: string;
    text: string;
    url: string;
    symbol?: string;
    sentiment?: "Positive" | "Negative" | "Neutral";
}

/** /stable/stock-market-gainers|losers|actives response item */
export interface FMPMover {
    symbol: string;
    name: string;
    change: number;
    changesPercentage: number;
    price: number;
    dayLow: number;
    dayHigh: number;
    yearHigh: number;
    yearLow: number;
    marketCap: number;
    volume: number;
    avgVolume: number;
    exchange: string;
}

/** /stable/insider-trading response item */
export interface FMPInsiderTrade {
    symbol: string;
    filingDate: string;
    transactionDate: string;
    reportingCik: string;
    transactionType: string;
    securitiesOwned: number;
    companyCik: string;
    reportingName: string;
    typeOfOwner: string;
    acquistionOrDisposition: string;
    formType: string;
    securitiesTransacted: number;
    price: number;
    securityName: string;
    link: string;
}

/** /stable/earnings-calendar response item */
export interface FMPEarningsEvent {
    date: string;
    symbol: string;
    eps: number | null;
    epsEstimated: number | null;
    time: string;
    revenue: number | null;
    revenueEstimated: number | null;
    updatedFromDate: string;
    fiscalDateEnding: string;
}

/** /stable/dividends-calendar response item */
export interface FMPDividendEvent {
    date: string;
    label: string;
    adjDividend: number;
    symbol: string;
    dividend: number;
    recordDate: string;
    paymentDate: string;
    declarationDate: string;
}

/** /stable/historical-price-eod/full response wrapper */
export interface FMPHistoricalWrapper {
    symbol: string;
    historical: FMPHistoricalBar[];
}

/** Single OHLCV bar */
export interface FMPHistoricalBar {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjClose: number;
    volume: number;
    unadjustedVolume: number;
    change: number;
    changePercent: number;
    vwap: number;
    label: string;
    changeOverTime: number;
}

/** /stable/insider-trading-statistics response item */
export interface FMPInsiderStats {
    symbol: string;
    cik: string;
    year: number;
    quarter: number;
    purchases: number;
    sales: number;
    buySellRatio: number;
    totalBought: number;
    totalSold: number;
    averageBought: number;
    averageSold: number;
    pPurchases: number;
    sSales: number;
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

// ─── Plan-Limited Error ───────────────────────────────────────

/**
 * Thrown when FMP indicates the endpoint is not available on the current
 * subscription plan (typically 404 `[]` or 402 Restricted/Premium).
 */
export class FMPPlanError extends Error {
    constructor(endpoint = "unknown", reason?: string) {
        super(
            `FMP endpoint '${endpoint}' is not available on the current plan${reason ? ` (${reason})` : ""}`,
        );
        this.name = "FMPPlanError";
    }
}

// ─── Fetch Helper ─────────────────────────────────────────────

/**
 * Fetch with automatic retry on 429 (rate-limit) using exponential backoff.
 * Retries up to 3 times with delays of 1 s, 2 s, 4 s.
 *
 * Throws `FMPPlanError` when the endpoint is plan-restricted.
 */
async function fmpFetch<T>(url: string, revalidate = 60): Promise<T> {
    const MAX_RETRIES = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            const delayMs = Math.pow(2, attempt - 1) * 1000;
            await new Promise((r) => setTimeout(r, delayMs));
        }

        const response = await fetch(url, { next: { revalidate } });

        if (response.status === 429) {
            lastError = new Error(`FMP rate limit (429) — attempt ${attempt + 1}`);
            continue;
        }

        if (response.status === 402 || response.status === 404) {
            const body = await response.text().catch(() => "");
            const trimmedBody = body.trim();
            const isPlanLimited =
                response.status === 402 ||
                trimmedBody === "[]" ||
                trimmedBody === "" ||
                trimmedBody.includes("Restricted Endpoint") ||
                trimmedBody.includes("Premium Query Parameter") ||
                trimmedBody.includes("Special Endpoint") ||
                trimmedBody.includes("not available under your current subscription");

            if (isPlanLimited) {
                const endpoint = new URL(url).pathname;
                throw new FMPPlanError(endpoint, `${response.status}`);
            }
            throw new Error(`FMP API error: ${response.status} ${response.statusText} — ${body.slice(0, 200)}`);
        }

        if (!response.ok) {
            const body = await response.text().catch(() => "");
            throw new Error(`FMP API error: ${response.status} ${response.statusText} — ${body.slice(0, 200)}`);
        }

        return response.json() as Promise<T>;
    }

    throw lastError ?? new Error("FMP fetch failed after retries");
}

// ─── Client ───────────────────────────────────────────────────

/** Financial Modeling Prep API client (using /stable/ endpoints) */
export const fmpClient = {
    /**
     * Get latest Senate trading disclosures.
        * Starter plan: ✅ Available
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
        * Starter plan: ✅ Available
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
        * Starter plan: ✅ Available
     * Endpoint: /stable/quote?symbol=AAPL
     */
    async getQuote(symbols: string | string[]): Promise<FMPQuote[]> {
        const normalizeQuote = (quote: FMPQuote): FMPQuote => ({
            ...quote,
            changesPercentage: quote.changePercentage ?? quote.changesPercentage,
        });

        const fetchSingleQuote = async (symbol: string): Promise<FMPQuote[]> => {
            try {
                return await fmpFetch<FMPQuote[]>(
                    `${FMP_STABLE}/quote?symbol=${symbol}&apikey=${getApiKey()}`,
                );
            } catch (error) {
                if (error instanceof FMPPlanError) {
                    return [];
                }
                throw error;
            }
        };

        if (!Array.isArray(symbols)) {
            const quotes = await fetchSingleQuote(symbols);
            return quotes.map(normalizeQuote);
        }

        const cleanedSymbols = symbols
            .map((symbol) => symbol.trim().toUpperCase())
            .filter(Boolean);

        if (cleanedSymbols.length === 0) {
            return [];
        }

        if (cleanedSymbols.length === 1) {
            const singleSymbolQuotes = await fetchSingleQuote(cleanedSymbols[0]);
            return singleSymbolQuotes.map(normalizeQuote);
        }

        try {
            const batchedQuotes = await fmpFetch<FMPQuote[]>(
                `${FMP_STABLE}/quote?symbol=${cleanedSymbols.join(",")}&apikey=${getApiKey()}`,
            );
            if (batchedQuotes.length > 0) {
                return batchedQuotes.map(normalizeQuote);
            }

            const settledQuotes = await Promise.allSettled(
                cleanedSymbols.map((symbol) => fetchSingleQuote(symbol)),
            );

            const collectedQuotes: FMPQuote[] = [];
            for (const settledResult of settledQuotes) {
                if (settledResult.status === "fulfilled") {
                    collectedQuotes.push(...settledResult.value);
                }
            }

            return collectedQuotes.map(normalizeQuote);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isPlanLimitedBatch =
                errorMessage.includes("402") ||
                errorMessage.includes("Premium Query Parameter") ||
                errorMessage.includes("Special Endpoint");

            if (!isPlanLimitedBatch) {
                throw error;
            }

            const settledQuotes = await Promise.allSettled(
                cleanedSymbols.map((symbol) => fetchSingleQuote(symbol)),
            );

            const collectedQuotes: FMPQuote[] = [];
            for (const settledResult of settledQuotes) {
                if (settledResult.status === "fulfilled") {
                    collectedQuotes.push(...settledResult.value);
                }
            }

            if (collectedQuotes.length === 0) {
                throw error;
            }

            return collectedQuotes.map(normalizeQuote);
        }
    },

    /**
     * Get sector performance snapshot for heatmap.
        * Starter plan: ✅ Available
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
     * Starter plan: ✅ Available
     * Endpoint: /stable/profile?symbol=AAPL
     */
    async getProfile(symbol: string): Promise<FMPCompanyProfile[]> {
        return fmpFetch<FMPCompanyProfile[]>(
            `${FMP_STABLE}/profile?symbol=${symbol}&apikey=${getApiKey()}`,
            3600,
        );
    },

    // ─── Starter Plan: New Endpoints ────────────────────────────

    /**
     * Get market movers (gainers, losers, or most active).
     * Starter plan: ✅ Available
     * Endpoint: /stable/biggest-gainers | biggest-losers | most-actives
     */
    async getMarketMovers(type: "gainers" | "losers" | "actives"): Promise<FMPMover[]> {
        const path = type === "gainers"
            ? "biggest-gainers"
            : type === "losers"
            ? "biggest-losers"
            : "most-actives";
        return fmpFetch<FMPMover[]>(
            `${FMP_STABLE}/${path}?apikey=${getApiKey()}`,
            180, // 3 min cache
        );
    },

    /**
     * Get financial news articles.
     * Endpoint family: /stable/news/{type}-latest?page=N&limit=N
     * Note: this endpoint can be plan-restricted depending on subscription.
     */
    async getNews(options: {
        type?: "general" | "stock" | "crypto" | "forex";
        symbol?: string;
        limit?: number;
        page?: number;
    } = {}): Promise<FMPNewsArticle[]> {
        const { type = "general", symbol, limit = 20, page = 0 } = options;
        const safeType = ["general", "stock", "crypto", "forex"].includes(type) ? type : "general";
        const path = `${FMP_STABLE}/news/${safeType}-latest?page=${page}&limit=${limit}&apikey=${getApiKey()}`;

        const articles = await fmpFetch<FMPNewsArticle[]>(
            path,
            300, // 5 min cache
        );

        if (!symbol) {
            return articles;
        }

        const normalizedSymbol = symbol.toUpperCase();
        return articles.filter((article) => {
            const articleSymbol = article.symbol?.toUpperCase();
            if (articleSymbol) {
                return articleSymbol === normalizedSymbol;
            }
            const title = article.title?.toUpperCase() ?? "";
            const text = article.text?.toUpperCase() ?? "";
            return title.includes(normalizedSymbol) || text.includes(normalizedSymbol);
        });
    },

    /**
     * Get end-of-day historical price data for a symbol.
     * Starter plan: ✅ Available (up to 5 years)
     * Endpoint: /stable/historical-price-eod/full?symbol=X&from=YYYY-MM-DD&to=YYYY-MM-DD
     */
    async getStockHistory(
        symbol: string,
        from: string,
        to: string,
    ): Promise<FMPHistoricalWrapper> {
        return fmpFetch<FMPHistoricalWrapper>(
            `${FMP_STABLE}/historical-price-eod/full?symbol=${symbol}&from=${from}&to=${to}&apikey=${getApiKey()}`,
            600, // 10 min cache
        );
    },

    /**
     * Get insider trades for a symbol.
     * Primary endpoint: /stable/insider-trading/search?symbol=X&limit=N&page=N
     * Fallback endpoint: /stable/insider-trading/latest (filtered in-app)
     */
    async getInsiderTrades(
        symbol: string,
        limit = 50,
        page = 0,
    ): Promise<FMPInsiderTrade[]> {
        const normalizedSymbol = symbol.toUpperCase();

        const normalizeTrade = (trade: any): FMPInsiderTrade => ({
            ...trade,
            acquistionOrDisposition:
                trade.acquistionOrDisposition ?? trade.acquisitionOrDisposition ?? "",
            link: trade.link ?? trade.url ?? "",
        });

        try {
            const searchedTrades = await fmpFetch<FMPInsiderTrade[]>(
                `${FMP_STABLE}/insider-trading/search?symbol=${normalizedSymbol}&limit=${limit}&page=${page}&apikey=${getApiKey()}`,
                600,
            );
            return searchedTrades.map(normalizeTrade);
        } catch (error) {
            if (!(error instanceof FMPPlanError)) {
                throw error;
            }

            const offset = page * limit;
            const targetSize = offset + limit;
            const aggregated: FMPInsiderTrade[] = [];
            const scanLimit = Math.min(Math.max(limit * 4, 100), 500);

            for (let scanPage = 0; scanPage < 10 && aggregated.length < targetSize; scanPage++) {
                const latestPageTrades = await fmpFetch<FMPInsiderTrade[]>(
                    `${FMP_STABLE}/insider-trading/latest?limit=${scanLimit}&page=${scanPage}&apikey=${getApiKey()}`,
                    600,
                );

                const matched = latestPageTrades
                    .filter((trade) => trade.symbol?.toUpperCase() === normalizedSymbol)
                    .map(normalizeTrade);

                aggregated.push(...matched);

                if (latestPageTrades.length < scanLimit) {
                    break;
                }
            }

            return aggregated.slice(offset, offset + limit);
        }
    },

    /**
     * Get insider trading statistics for a symbol.
        * Endpoint can be plan-restricted depending on subscription tier.
     * Endpoint: /stable/insider-trading-statistics?symbol=X
     */
    async getInsiderTradeStats(symbol: string): Promise<FMPInsiderStats[]> {
        return fmpFetch<FMPInsiderStats[]>(
            `${FMP_STABLE}/insider-trading-statistics?symbol=${symbol}&apikey=${getApiKey()}`,
            600,
        );
    },

    /**
     * Get earnings calendar for a date range.
     * Starter plan: ✅ Available
     * Endpoint: /stable/earnings-calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
     */
    async getEarningsCalendar(from: string, to: string): Promise<FMPEarningsEvent[]> {
        return fmpFetch<FMPEarningsEvent[]>(
            `${FMP_STABLE}/earnings-calendar?from=${from}&to=${to}&apikey=${getApiKey()}`,
            900, // 15 min cache
        );
    },

    /**
     * Get dividends calendar for a date range.
     * Starter plan: ✅ Available
     * Endpoint: /stable/dividends-calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
     */
    async getDividendsCalendar(from: string, to: string): Promise<FMPDividendEvent[]> {
        return fmpFetch<FMPDividendEvent[]>(
            `${FMP_STABLE}/dividends-calendar?from=${from}&to=${to}&apikey=${getApiKey()}`,
            900, // 15 min cache
        );
    },
};

export type {
    FMPSenateTrade,
    FMPHouseDisclosure,
    FMPQuote,
    FMPSectorPerformance,
    FMPCompanyProfile,
};
