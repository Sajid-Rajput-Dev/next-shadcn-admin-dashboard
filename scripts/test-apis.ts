
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";

async function testEndpoint(name: string, path: string, method: string = "GET", body?: any, headers: any = {}) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Testing ${name} (${method} ${path})...`);
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            const data = await res.json();
            const preview = JSON.stringify(data).slice(0, 150) + (JSON.stringify(data).length > 150 ? "..." : "");
            console.log("Response Preview:", preview);
            return true;
        } else {
            const errorText = await res.text();
            console.error("Error:", errorText.slice(0, 200));
            return false;
        }
    } catch (error) {
        console.error("Fetch failed:", error);
        return false;
    }
}

async function main() {
    console.log("Starting API Verification...");

    // Auth Setup
    let authHeaders = {};
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email: "tester_mvp@example.com",
            password: "Password123!",
        });

        if (session) {
            console.log("Authenticated as tester_mvp@example.com");
            // Construct the cookie: sb-<project-ref>-auth-token
            // The value is typically a stringified array of [access_token, refresh_token]
            // or a JSON object depending on the storage format. 
            // @supabase/ssr usually expects: `base64(JSON.stringify(session))` or similar? 
            // actually, let's try the simplest: explicit access_token if the server supports it, 
            // but the server only reads cookies.

            // Project Ref from URL: https://zewpdurufizcvlvpbfzg.supabase.co -> zewpdurufizcvlvpbfzg
            const projectRef = "zewpdurufizcvlvpbfzg";
            const cookieName = `sb-${projectRef}-auth-token`;

            // Supabase SSR often uses this format:
            const cookieValue = `base64-${session.access_token}-${session.refresh_token}`; // This is a guess.

            // Better guess: The client library sets it as JSON.
            // Let's try sending the access token in the Authorization header AND a cookie that mimics the session.
            // Actually, we can define a simplified 'createClient' in the test that matches the server behavior? No.

            // Let's try the standard format: `access_token` as the value?
            // Or `v1-access_token`?

            // Let's rely on the Authorization Header working if we modify the server.ts TEMPORARILY? 
            // No, that invalidates the test.

            // Let's try: value = JSON.stringify({ access_token: ..., refresh_token: ... })
            // or value = ["access_token", "refresh_token"] (Storage typically uses this)
            const tokenString = JSON.stringify([session.access_token, session.refresh_token]);
            authHeaders = {
                Authorization: `Bearer ${session.access_token}`,
                Cookie: `${cookieName}=${encodeURIComponent(tokenString)};`
            };
        } else {
            console.warn("Authentication failed, skipping authenticated tests:", error?.message);
        }
    } else {
        console.warn("Missing Supabase credentials, skipping authenticated tests.");
    }

    // --- Public Endpoints ---
    await testEndpoint("Congress Trades (Public)", "/api/congress/trades");

    // --- Protected Endpoints (Unauthenticated) ---
    await testEndpoint("Watchlist (Unauthenticated)", "/api/watchlist");
    await testEndpoint("Market Status (Unauthenticated)", "/api/market-status"); // Assuming this exists or similar

    // --- Protected Endpoints (Authenticated) ---
    if (Object.keys(authHeaders).length > 0) {
        await testEndpoint("Watchlist (Authenticated GET)", "/api/watchlist", "GET", undefined, authHeaders);

        // Initial POST
        await testEndpoint("Watchlist (Authenticated POST)", "/api/watchlist", "POST", {
            ticker: "TSLA",
            type: "stock"
        }, authHeaders);

        // Is there a DELETE? Usually requires ID.
        // We'd need to parse the GET response to find the ID of the item we just added to delete it.
        // Skipping complex flow for now, just verifying endpoints are reachable.
    }

    // Check for other endpoints from previous conversations/find output
    // src/app/api/congress/trades/route.ts -> Checked
    // src/app/api/watchlist/route.ts -> Checked
    // src/app/api/cron/update-market-data/route.ts -> Protected by CRON_SECRET, skipping or testing 401
    await testEndpoint("Cron Job (Unauthorized)", "/api/cron/update-market-data");
}

main();
