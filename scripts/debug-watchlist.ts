
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
    console.log("Debugging Watchlist Table...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check if table exists and we can select from it (Bypass RLS)
    const { data, error } = await supabase
        .from("watchlist_items")
        .select("*")
        .limit(5);

    if (error) {
        console.error("Service Role Select Failed:", error);
    } else {
        console.log("Service Role Select Success. Count:", data.length);
        console.log("Data sample:", data);
    }

    // 2. Check Table Info (if possible via rpc, or just infer from error)
}

main();
