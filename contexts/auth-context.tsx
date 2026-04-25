"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  authReady: boolean;
  /** @deprecated use `authReady` instead */
  loading: boolean;
  needsOnboarding: boolean;
  signInWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT_MS = 3000;

async function fetchRole(userId: string): Promise<AppRole | null> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.role as AppRole | undefined) ?? null;
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    (async () => {
      const result = await withTimeout(
        supabase.auth.getSession(),
        SESSION_TIMEOUT_MS,
        { data: { session: null }, error: null } as Awaited<
          ReturnType<typeof supabase.auth.getSession>
        >,
      );
      if (!mounted) return;
      const s = result.data.session;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const r = await fetchRole(s.user.id);
        if (!mounted) return;
        setRole(r);
      }
      initialized = true;
      if (mounted) setAuthReady(true);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted || !initialized) return;
      // Token refreshes don't change identity — just sync session and bail.
      if (event === "TOKEN_REFRESHED") {
        setSession(s);
        return;
      }
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const r = await fetchRole(s.user.id);
        if (!mounted) return;
        setRole(r);
      } else {
        setRole(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = useCallback(async (email: string) => {
    const { error: e } = await supabase.auth.signInWithOtp({ email });
    if (e) throw e;
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { error: e } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (e) throw e;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  }, []);

  const refreshRole = useCallback(async () => {
    if (!user) return;
    const r = await fetchRole(user.id);
    setRole(r);
  }, [user]);

  const needsOnboarding = authReady && !!user && role === null;

  const value = useMemo(
    () => ({
      user,
      session,
      role,
      authReady,
      loading: !authReady,
      needsOnboarding,
      signInWithOtp,
      verifyOtp,
      signOut,
      refreshRole,
    }),
    [
      user,
      session,
      role,
      authReady,
      needsOnboarding,
      signInWithOtp,
      verifyOtp,
      signOut,
      refreshRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
