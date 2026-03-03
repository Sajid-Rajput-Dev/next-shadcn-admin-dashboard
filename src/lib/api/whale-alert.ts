import { API_URLS, WHALE_MIN_VALUE_USD } from "@/lib/utils/constants";

const WA_BASE = API_URLS.WHALE_ALERT;

function getApiKey(): string {
  const key = process.env.WHALE_ALERT_API_KEY;
  if (!key) throw new Error("WHALE_ALERT_API_KEY is not set");
  return key;
}

/** Whale Alert transaction */
interface WATransaction {
  blockchain: string;
  symbol: string;
  id: string;
  transaction_type: string;
  hash: string;
  from: {
    address: string;
    owner_type: string;
    owner: string;
  };
  to: {
    address: string;
    owner_type: string;
    owner: string;
  };
  timestamp: number;
  amount: number;
  amount_usd: number;
  transaction_count: number;
}

/** Whale Alert API response */
interface WAResponse {
  result: string;
  cursor: string;
  count: number;
  transactions: WATransaction[];
}

async function waFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Whale Alert rate limit exceeded. Please try again later.");
    }
    throw new Error(`Whale Alert API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

/** Whale Alert API client */
export const whaleAlertClient = {
  /** Get recent whale transactions */
  /** Get recent whale transactions */
  async getRecentTransactions(options?: {
    minValueUsd?: number;
    start?: number;
    limit?: number;
    cursor?: string;
  }): Promise<WAResponse> {
    const { minValueUsd = WHALE_MIN_VALUE_USD, start, cursor, limit } = options || {};
    const since = start || Math.floor(Date.now() / 1000) - 3600; // default: last 1 hour
    const params = new URLSearchParams({
      api_key: getApiKey(),
      min_value: minValueUsd.toString(),
      start: since.toString(),
    });
    if (limit) params.set("limit", limit.toString());
    if (cursor) params.set("cursor", cursor);

    return waFetch<WAResponse>(`${WA_BASE}/transactions?${params}`);
  },

  /** Get a specific transaction by hash */
  async getTransactionByHash(hash: string, blockchain: string): Promise<WAResponse> {
    return waFetch<WAResponse>(`${WA_BASE}/transaction/${blockchain}/${hash}?api_key=${getApiKey()}`);
  },
};

export type { WATransaction, WAResponse };
