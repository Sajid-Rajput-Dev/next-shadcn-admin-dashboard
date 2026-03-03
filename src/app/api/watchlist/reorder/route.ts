import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const items: { id: string; display_order: number }[] = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required 'items' array" }, { status: 400 });
    }

    // Bulk update display_order for each item (user-scoped for security)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const updates = await Promise.allSettled(
      items.map(
        ({ id, display_order }) =>
          db.from("watchlist_items").update({ display_order }).eq("id", id).eq("user_id", user.id), // RLS + explicit guard
      ),
    );

    const failed = updates.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      console.error(`[API] Watchlist reorder: ${failed}/${items.length} updates failed`);
    }

    return NextResponse.json({ success: true, updated: items.length - failed });
  } catch (error) {
    console.error("[API] Watchlist reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder watchlist" }, { status: 500 });
  }
}
