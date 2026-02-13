import { fmpClient } from "../src/lib/api/fmp";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyFMP() {
    console.log("Verifying FMP API...");
    if (!process.env.FMP_API_KEY) {
        console.error("❌ FMP_API_KEY is missing in .env.local");
        process.exit(1);
    }
    console.log("Key found:", process.env.FMP_API_KEY.slice(0, 5) + "...");

    try {
        const senate = await fmpClient.getSenateTrades(0);
        console.log(`✅ Senate Trades fetched: ${senate.length} items`);
        if (senate.length > 0) {
            console.log("Sample:", senate[0].ticker, senate[0].transactionDate);
        }
    } catch (error) {
        console.error("❌ Failed to fetch Senate trades:", error);
    }

    try {
        const house = await fmpClient.getHouseDisclosures(0);
        console.log(`✅ House Disclosures fetched: ${house.length} items`);
    } catch (error) {
        console.error("❌ Failed to fetch House disclosures:", error);
    }
}

verifyFMP();
