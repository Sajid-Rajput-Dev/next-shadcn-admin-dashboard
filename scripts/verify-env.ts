import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyEnv() {
    console.log("🔍 Verifying Environment & Database...");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing");
    else console.log("✅ NEXT_PUBLIC_SUPABASE_URL found");

    if (!anonKey) console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
    else console.log("✅ NEXT_PUBLIC_SUPABASE_ANON_KEY found");

    if (!serviceKey) console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing");
    else console.log("✅ SUPABASE_SERVICE_ROLE_KEY found");

    if (!url || !serviceKey) {
        console.error("⛔ Cannot proceed with DB check due to missing keys.");
        process.exit(1);
    }

    try {
        const supabase = createClient(url, serviceKey);
        // Try to fetch a single row from a known table or list tables if possible
        // We'll try to fetch from 'congress_trades' as it should exist
        const { data, error } = await supabase.from("congress_trades").select("count").limit(1);

        if (error) {
            console.error("❌ Database Connection Failed:", error.message);
            // Check if it's a 404/400 which might mean the table doesn't exist
            if (error.code === "42P01") {
                console.error("⚠️ Table 'congress_trades' does not exist. Schema migration might be missing.");
            }
        } else {
            console.log("✅ Database Connection Successful!");
            console.log("✅ Table 'congress_trades' exists and is accessible.");
        }
    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
}

verifyEnv();
