import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

async function getAuthUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return { supabase, user };
}

export async function GET() {
    try {
        const { supabase, user } = await getAuthUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("watchlist_items")
            .select("*")
            .eq("user_id", user.id)
            .order("added_at", { ascending: false });

        if (error) {
            console.error("[API] Watchlist GET error:", error);
            return NextResponse.json(
                { error: "Failed to fetch watchlist" },
                { status: 500 },
            );
        }

        return NextResponse.json({ data: data || [] });
    } catch (error) {
        console.error("[API] Watchlist GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch watchlist" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const { supabase, user } = await getAuthUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { ticker, asset_type, name } = body;

        if (!ticker || !asset_type) {
            return NextResponse.json(
                { error: "Missing required fields: ticker, asset_type" },
                { status: 400 },
            );
        }

        const { data, error } = await supabase
            .from("watchlist_items")
            .upsert(
                {
                    user_id: user.id,
                    ticker: ticker.toUpperCase(),
                    asset_type,
                    name: name || ticker.toUpperCase(),
                } as any,
                { onConflict: "user_id,ticker,asset_type" },
            )
            .select()
            .single();

        if (error) {
            console.error("[API] Watchlist POST error:", error);
            return NextResponse.json(
                { error: "Failed to add to watchlist" },
                { status: 500 },
            );
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
        console.error("[API] Watchlist POST error:", error);
        return NextResponse.json(
            { error: "Failed to add to watchlist" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { supabase, user } = await getAuthUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Missing required 'id' parameter" },
                { status: 400 },
            );
        }

        const { error } = await supabase
            .from("watchlist_items")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            console.error("[API] Watchlist DELETE error:", error);
            return NextResponse.json(
                { error: "Failed to remove from watchlist" },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] Watchlist DELETE error:", error);
        return NextResponse.json(
            { error: "Failed to remove from watchlist" },
            { status: 500 },
        );
    }
}
