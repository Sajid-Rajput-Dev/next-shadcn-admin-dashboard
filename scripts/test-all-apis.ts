/**
 * Comprehensive API Test Script
 * Tests ALL external APIs (FMP, CoinGecko, Whale Alert) directly
 * AND all internal API routes through the Next.js server.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";

// ─── Helpers ───────────────────────────────────────────────────

interface TestResult {
    name: string;
    category: "EXTERNAL" | "INTERNAL";
    status: "PASS" | "FAIL";
    httpStatus?: number;
    detail: string;
    dataPreview?: string;
}

const results: TestResult[] = [];
const DIVIDER = "═".repeat(70);

function truncate(obj: any, maxLen = 300): string {
    const str = JSON.stringify(obj, null, 2);
    return str.length > maxLen ? str.slice(0, maxLen) + "\n... [truncated]" : str;
}

async function testApi(
    name: string,
    category: "EXTERNAL" | "INTERNAL",
    url: string,
    options: RequestInit = {},
): Promise<void> {
    console.log(`\n${DIVIDER}`);
    console.log(`🔍 ${category} | ${name}`);
    console.log(`   URL: ${url.replace(/apikey=[^&]+/, "apikey=***").replace(/api_key=[^&]+/, "api_key=***")}`);
    try {
        const start = Date.now();
        const res = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
        const elapsed = Date.now() - start;
        const contentType = res.headers.get("content-type") || "";
        let body: any;

        if (contentType.includes("application/json")) {
            body = await res.json();
        } else {
            const text = await res.text();
            body = text.slice(0, 200);
        }

        const isOk = res.status >= 200 && res.status < 300;
        const isMock = body?.isMock === true;
        const statusLabel = isOk ? (isMock ? "⚠️  PASS (MOCK)" : "✅ PASS") : "❌ FAIL";

        console.log(`   Status: ${res.status} ${res.statusText}  (${elapsed}ms)`);
        console.log(`   Result: ${statusLabel}`);

        if (isOk && body) {
            // Show data shape
            const dataKey = body.data ?? body;
            if (Array.isArray(dataKey)) {
                console.log(`   Records: ${dataKey.length}`);
                if (dataKey.length > 0) console.log(`   Sample:  ${truncate(dataKey[0], 200)}`);
            } else if (typeof dataKey === "object") {
                const keys = Object.keys(dataKey).slice(0, 10);
                console.log(`   Keys:    [${keys.join(", ")}]`);
            }
        } else if (!isOk) {
            console.log(`   Error:   ${truncate(body, 200)}`);
        }

        results.push({
            name,
            category,
            status: isOk ? "PASS" : "FAIL",
            httpStatus: res.status,
            detail: isOk
                ? `${elapsed}ms${isMock ? " (mock data)" : ""}${Array.isArray(body?.data ?? body) ? `, ${(body?.data ?? body).length} records` : ""}`
                : `${res.status} ${res.statusText}`,
            dataPreview: isOk ? truncate(body, 150) : undefined,
        });
    } catch (err: any) {
        console.log(`   ❌ ERROR: ${err.message}`);
        results.push({
            name,
            category,
            status: "FAIL",
            detail: err.message,
        });
    }
}

// ─── EXTERNAL API TESTS ───────────────────────────────────────

async function testExternalAPIs() {
    console.log("\n\n" + "▓".repeat(70));
    console.log("  SECTION 1: EXTERNAL API TESTS (Direct)");
    console.log("▓".repeat(70));

    const FMP_KEY = process.env.FMP_API_KEY!;
    const CG_KEY = process.env.COINGECKO_API_KEY;
    const WA_KEY = process.env.WHALE_ALERT_API_KEY!;

    // ── FMP: Senate Trading (Stable) ──
    await testApi(
        "FMP - Senate Trading (stable)",
        "EXTERNAL",
        `https://financialmodelingprep.com/stable/senate-latest?page=0&limit=25&apikey=${FMP_KEY}`,
    );

    // ── FMP: House Disclosures (Stable) ──
    await testApi(
        "FMP - House Disclosures (stable)",
        "EXTERNAL",
        `https://financialmodelingprep.com/stable/house-latest?page=0&limit=25&apikey=${FMP_KEY}`,
    );

    // ── FMP: Stock Quote (Stable) ──
    await testApi(
        "FMP - Stock Quote (stable, AAPL)",
        "EXTERNAL",
        `https://financialmodelingprep.com/stable/quote?symbol=AAPL&apikey=${FMP_KEY}`,
    );

    // ── FMP: Sector Performance (Stable) ──
    await testApi(
        "FMP - Sector Performance (stable)",
        "EXTERNAL",
        `https://financialmodelingprep.com/stable/sector-performance-snapshot?date=${new Date().toISOString().split("T")[0]}&apikey=${FMP_KEY}`,
    );

    // ── FMP: Company Profile (Stable) ──
    await testApi(
        "FMP - Company Profile (stable, AAPL)",
        "EXTERNAL",
        `https://financialmodelingprep.com/stable/profile?symbol=AAPL&apikey=${FMP_KEY}`,
    );

    // ── FMP: Market Movers (Stable) ──
    await testApi(
        "FMP - Biggest Gainers (stable)",
        "EXTERNAL",
        `https://financialmodelingprep.com/stable/biggest-gainers?apikey=${FMP_KEY}`,
    );

    // ── FMP: Insider Trading Latest (Stable) ──
    await testApi(
        "FMP - Insider Trading Latest (stable)",
        "EXTERNAL",
        `https://financialmodelingprep.com/stable/insider-trading/latest?page=0&limit=10&apikey=${FMP_KEY}`,
    );

    // ── CoinGecko: Coins Markets ──
    const cgHeaders: Record<string, string> = { Accept: "application/json" };
    if (CG_KEY) cgHeaders["x-cg-demo-api-key"] = CG_KEY;

    await testApi(
        "CoinGecko - Coins/Markets (top 5)",
        "EXTERNAL",
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false`,
        { headers: cgHeaders },
    );

    // ── CoinGecko: Trending ──
    await testApi(
        "CoinGecko - Trending",
        "EXTERNAL",
        `https://api.coingecko.com/api/v3/search/trending`,
        { headers: cgHeaders },
    );

    // ── CoinGecko: Global ──
    await testApi(
        "CoinGecko - Global Stats",
        "EXTERNAL",
        `https://api.coingecko.com/api/v3/global`,
        { headers: cgHeaders },
    );

    // ── CoinGecko: Simple Price ──
    await testApi(
        "CoinGecko - Simple Price (BTC, ETH)",
        "EXTERNAL",
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`,
        { headers: cgHeaders },
    );

    // ── Whale Alert: Recent Transactions ──
    const since = Math.floor(Date.now() / 1000) - 3600;
    await testApi(
        "Whale Alert - Recent Transactions",
        "EXTERNAL",
        `https://api.whale-alert.io/v1/transactions?api_key=${WA_KEY}&min_value=500000&start=${since}&limit=5`,
    );
}

// ─── INTERNAL API TESTS ───────────────────────────────────────

async function testInternalAPIs() {
    console.log("\n\n" + "▓".repeat(70));
    console.log("  SECTION 2: INTERNAL API TESTS (via Next.js Server)");
    console.log("▓".repeat(70));

    // ── Congress Trades ──
    await testApi(
        "Congress Trades (GET)",
        "INTERNAL",
        `${BASE_URL}/api/congress/trades?page=0&chamber=both`,
    );

    // ── Congress Trades - Senate Only ──
    await testApi(
        "Congress Trades - Senate (GET)",
        "INTERNAL",
        `${BASE_URL}/api/congress/trades?page=0&chamber=senate`,
    );

    // ── Congress Trades - House Only ──
    await testApi(
        "Congress Trades - House (GET)",
        "INTERNAL",
        `${BASE_URL}/api/congress/trades?page=0&chamber=house`,
    );

    // ── Congress Alerts ──
    await testApi(
        "Congress Alerts (GET)",
        "INTERNAL",
        `${BASE_URL}/api/congress/alerts?limit=5`,
    );

    // ── Congress Politicians ──
    await testApi(
        "Congress Politicians (GET)",
        "INTERNAL",
        `${BASE_URL}/api/congress/politicians`,
    );

    // ── Crypto Prices ──
    await testApi(
        "Crypto Prices (GET)",
        "INTERNAL",
        `${BASE_URL}/api/crypto/prices?page=1&per_page=5`,
    );

    // ── Crypto Whales ──
    await testApi(
        "Crypto Whales (GET)",
        "INTERNAL",
        `${BASE_URL}/api/crypto/whales?limit=5`,
    );

    // ── Stocks Heatmap ──
    await testApi(
        "Stocks Heatmap (GET)",
        "INTERNAL",
        `${BASE_URL}/api/stocks/heatmap`,
    );

    // ── Stocks Quotes ──
    await testApi(
        "Stock Quotes (GET) - AAPL,MSFT",
        "INTERNAL",
        `${BASE_URL}/api/stocks/quotes?symbols=AAPL,MSFT`,
    );

    // ── Stock Quotes - Missing param validation ──
    await testApi(
        "Stock Quotes - Missing Param (GET)",
        "INTERNAL",
        `${BASE_URL}/api/stocks/quotes`,
    );

    // ── Watchlist (unauthenticated → expect 401) ──
    await testApi(
        "Watchlist (Unauthenticated GET → 401)",
        "INTERNAL",
        `${BASE_URL}/api/watchlist`,
    );

    // ── Cron: Sync Congress (no auth → expect 401) ──
    await testApi(
        "Cron Sync Congress (No Auth → 401)",
        "INTERNAL",
        `${BASE_URL}/api/cron/sync-congress`,
        { method: "POST" },
    );

    // ── Cron: Sync Congress (with CRON_SECRET) ──
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        await testApi(
            "Cron Sync Congress (With Auth)",
            "INTERNAL",
            `${BASE_URL}/api/cron/sync-congress`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${cronSecret}` },
            },
        );

        await testApi(
            "Cron Sync Whales (With Auth)",
            "INTERNAL",
            `${BASE_URL}/api/cron/sync-whales`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${cronSecret}` },
            },
        );
    }
}

// ─── SUMMARY ──────────────────────────────────────────────────

function printSummary() {
    console.log("\n\n" + "▓".repeat(70));
    console.log("  FINAL RESULTS SUMMARY");
    console.log("▓".repeat(70));

    const extResults = results.filter((r) => r.category === "EXTERNAL");
    const intResults = results.filter((r) => r.category === "INTERNAL");
    const extPass = extResults.filter((r) => r.status === "PASS").length;
    const intPass = intResults.filter((r) => r.status === "PASS").length;

    console.log(`\n  EXTERNAL APIs:  ${extPass}/${extResults.length} passed`);
    console.log(`  INTERNAL APIs:  ${intPass}/${intResults.length} passed`);
    console.log(`  TOTAL:          ${extPass + intPass}/${results.length} passed\n`);

    // Table header
    console.log("  " + "-".repeat(66));
    console.log(
        `  ${"Status".padEnd(8)}${"Category".padEnd(11)}${"Endpoint".padEnd(40)}${"Detail"}`,
    );
    console.log("  " + "-".repeat(66));

    for (const r of results) {
        const icon = r.status === "PASS" ? "✅" : "❌";
        console.log(
            `  ${icon.padEnd(6)} ${r.category.padEnd(11)}${r.name.padEnd(40).slice(0, 40)}${r.detail.slice(0, 30)}`,
        );
    }
    console.log("  " + "-".repeat(66));

    // Highlight failures
    const failures = results.filter((r) => r.status === "FAIL");
    if (failures.length > 0) {
        console.log("\n  ⚠️  FAILURES:");
        for (const f of failures) {
            // Some "failures" are actually expected (like 401 for unauthenticated)
            const isExpected =
                f.name.includes("→ 401") || f.name.includes("Missing Param");
            if (isExpected) {
                console.log(`    ✓ ${f.name} — EXPECTED (${f.detail})`);
            } else {
                console.log(`    ✗ ${f.name} — ${f.detail}`);
            }
        }
    }
}

// ─── MAIN ─────────────────────────────────────────────────────

async function main() {
    console.log("╔════════════════════════════════════════════════════════════════════╗");
    console.log("║        Capitol Alpha — Comprehensive API Test Suite              ║");
    console.log("║        Testing ALL External + Internal API Endpoints             ║");
    console.log("╚════════════════════════════════════════════════════════════════════╝");
    console.log(`  Timestamp: ${new Date().toISOString()}`);
    console.log(`  Server:    ${BASE_URL}`);

    await testExternalAPIs();
    await testInternalAPIs();
    printSummary();
}

main().catch(console.error);
