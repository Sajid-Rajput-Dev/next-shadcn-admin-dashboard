import { NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Auth callback handler for Supabase email confirmations.
 * Supabase redirects here after the user clicks the confirmation link in their email.
 * URL pattern: /api/auth/callback?code=xxx&next=/dashboard
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options),
                        );
                    },
                },
            },
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Redirect to the intended destination (default: /dashboard)
            return NextResponse.redirect(`${origin}${next}`);
        }

        console.error("[Auth Callback] Code exchange error:", error.message);
    }

    // Redirect to error page if code is missing or exchange failed
    return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
