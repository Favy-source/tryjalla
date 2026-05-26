import { useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  /** True once getSession() has resolved — prevents flash redirect to login */
  initialized: boolean;
}

export interface UseAuthReturn extends AuthState {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    initialized: false,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[useAuth] fetchProfile error:", error.message);
      return null;
    }
    return data;
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const profile = await fetchProfile(user.id);
    setState((prev) => ({ ...prev, profile }));
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Resolve initial session — this fires before onAuthStateChange
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      const profile = session?.user ? await fetchProfile(session.user.id) : null;

      setState({
        user: session?.user ?? null,
        session,
        profile,
        loading: false,
        initialized: true,
      });
    });

    // Listen for subsequent auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const profile = session?.user ? await fetchProfile(session.user.id) : null;

      setState({
        user: session?.user ?? null,
        session,
        profile,
        loading: false,
        initialized: true,
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will update state automatically
  }, []);

  return { ...state, signOut, refreshProfile };
}
