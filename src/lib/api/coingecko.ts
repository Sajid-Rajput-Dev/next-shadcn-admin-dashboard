import { API_URLS } from "@/lib/utils/constants";

const CG_BASE = API_URLS.COINGECKO;

function getHeaders(): HeadersInit {
  const key = process.env.COINGECKO_API_KEY;
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (key) {
    headers["x-cg-demo-api-key"] = key;
  }
  return headers;
}

/** CoinGecko coins/markets response item */
interface CGMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

/** CoinGecko trending coin */
interface CGTrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
  };
}

/** CoinGecko global data */
interface CGGlobalData {
  data: {
    active_cryptocurrencies: number;
    upcoming_icos: number;
    ongoing_icos: number;
    ended_icos: number;
    markets: number;
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
    updated_at: number;
  };
}

/** CoinGecko simple price response */
interface CGSimplePrice {
  [coinId: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
  };
}

/** CoinGecko /search response coin item */
interface CGSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

async function cgFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 30 },
  });
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("CoinGecko rate limit exceeded. Please try again later.");
    }
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

/** CoinGecko API client */
export const coingeckoClient = {
  /** Get market data for top coins */
  async getCoinsMarkets(vsCurrency = "usd", perPage = 50, page = 1, sparkline = false): Promise<CGMarketCoin[]> {
    const params = new URLSearchParams({
      vs_currency: vsCurrency,
      order: "market_cap_desc",
      per_page: perPage.toString(),
      page: page.toString(),
      sparkline: sparkline.toString(),
      price_change_percentage: "7d",
    });
    return cgFetch<CGMarketCoin[]>(`${CG_BASE}/coins/markets?${params}`);
  },

  /** Get trending coins */
  async getTrending(): Promise<{ coins: CGTrendingCoin[] }> {
    return cgFetch<{ coins: CGTrendingCoin[] }>(`${CG_BASE}/search/trending`);
  },

  /** Get global market stats */
  async getGlobalStats(): Promise<CGGlobalData> {
    return cgFetch<CGGlobalData>(`${CG_BASE}/global`);
  },

  /** Get simple price for multiple coins */
  async getSimplePrice(coinIds: string[], includeMeta = true): Promise<CGSimplePrice> {
    const params = new URLSearchParams({
      ids: coinIds.join(","),
      vs_currencies: "usd",
      include_24hr_change: includeMeta.toString(),
      include_market_cap: includeMeta.toString(),
      include_24hr_vol: includeMeta.toString(),
    });
    return cgFetch<CGSimplePrice>(`${CG_BASE}/simple/price?${params}`);
  },

  /** Search coins/tokens by query string */
  async searchCoins(query: string): Promise<CGSearchResult[]> {
    const encoded = encodeURIComponent(query);
    const data = await cgFetch<{ coins: CGSearchResult[] }>(`${CG_BASE}/search?query=${encoded}`);
    return data.coins ?? [];
  },

  /** Get market data for specific coins by their CoinGecko IDs */
  async getCoinsByIds(ids: string[], options: { sparkline?: boolean } = {}): Promise<CGMarketCoin[]> {
    if (ids.length === 0) return [];
    const params = new URLSearchParams({
      vs_currency: "usd",
      ids: ids.join(","),
      order: "market_cap_desc",
      per_page: ids.length.toString(),
      page: "1",
      sparkline: (options.sparkline ?? false).toString(),
      price_change_percentage: "7d",
    });
    return cgFetch<CGMarketCoin[]>(`${CG_BASE}/coins/markets?${params}`);
  },
};

export type { CGMarketCoin, CGTrendingCoin, CGGlobalData, CGSimplePrice, CGSearchResult };
