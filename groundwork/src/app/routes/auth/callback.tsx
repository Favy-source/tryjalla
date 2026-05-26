import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase/client";

/**
 * OAuth callback handler.
 *
 * Supabase PKCE flow redirects here with ?code=XXXX after Google OAuth.
 * `detectSessionInUrl: true` in the client auto-exchanges the code for a
 * session. We also call exchangeCodeForSession manually as a belt-and-braces
 * fallback, then listen for the SIGNED_IN event to navigate away.
 */
export function meta() {
  return [{ title: "Signing in… — Groundwork by Jalla" }];
}

export default function CallbackPage() {
  const navigate = useNavigate();
  const exchanged = useRef(false);

  useEffect(() => {
    // Listen for auth state change fired when the code exchange completes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/", { replace: true });
      } else if (event === "PASSWORD_RECOVERY") {
        navigate("/auth/reset-password?step=new-password", { replace: true });
      }
    });

    // Belt-and-braces: manually exchange code if detectSessionInUrl hasn't
    // already done it (e.g. SPA navigation where client is pre-initialised)
    if (!exchanged.current) {
      exchanged.current = true;
      supabase.auth
        .exchangeCodeForSession(window.location.href)
        .then(({ error }) => {
          if (error) {
            console.error("[callback] code exchange failed:", error.message);
            navigate("/auth/login?error=oauth_failed", { replace: true });
          }
        });
    }

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center gap-3 text-brand-mid-grey">
      <div className="w-5 h-5 border-2 border-brand-mid-grey border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Completing sign in…</span>
    </div>
  );
}
