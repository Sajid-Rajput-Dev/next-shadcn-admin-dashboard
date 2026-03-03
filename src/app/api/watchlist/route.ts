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
      return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("[API] Watchlist GET error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ticker, name } = body;
    // Accept both snake_case (API convention) and camelCase (legacy hook)
    const asset_type: string | undefined = body.asset_type ?? body.assetType;

    if (!ticker || !asset_type) {
      return NextResponse.json({ error: "Missing required fields: ticker, asset_type" }, { status: 400 });
    }

    // Enforce 50-item limit
    const { count: existingCount } = await supabase
      .from("watchlist_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((existingCount ?? 0) >= 50) {
      return NextResponse.json({ error: "Watchlist limit reached. Maximum 50 assets allowed." }, { status: 422 });
    }

    const { data, error } = await supabase
      .from("watchlist_items")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[API] Watchlist POST error:", error);
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
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
    const ticker = searchParams.get("ticker");

    if (!id && !ticker) {
      return NextResponse.json({ error: "Missing required 'id' or 'ticker' parameter" }, { status: 400 });
    }

    let deleteQuery = supabase.from("watchlist_items").delete().eq("user_id", user.id);

    if (id) {
      deleteQuery = deleteQuery.eq("id", id);
    } else if (ticker) {
      deleteQuery = deleteQuery.eq("ticker", ticker.toUpperCase());
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error("[API] Watchlist DELETE error:", error);
      return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Watchlist DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
