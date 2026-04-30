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
  roleLoading: boolean;
  /** @deprecated use `authReady` instead */
  loading: boolean;
  needsOnboarding: boolean;
  signInWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.role as AppRole | undefined) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    let roleRequestId = 0;

    const applySession = async (nextSession: Session | null) => {
      const requestId = ++roleRequestId;
      if (!mounted) return;

      setAuthReady(false);
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setRole(null);
        setRoleLoading(false);
        setAuthReady(true);
        return;
      }

      setRoleLoading(true);
      try {
        const r = await fetchRole(nextSession.user.id);
        if (!mounted || requestId !== roleRequestId) return;
        setRole(r);
      } catch {
        if (!mounted || requestId !== roleRequestId) return;
        setRole(null);
      } finally {
        if (mounted && requestId === roleRequestId) {
          setRoleLoading(false);
          setAuthReady(true);
        }
      }
    };

    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session))
      .catch(() => applySession(null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;
      // Token refreshes don't change identity — just sync session and bail.
      if (event === "TOKEN_REFRESHED") {
        setSession(s);
        setUser(s?.user ?? null);
        return;
      }
      await applySession(s);
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
    setRoleLoading(false);
    setAuthReady(true);
  }, []);

  const refreshRole = useCallback(async () => {
    if (!user) return;
    setRoleLoading(true);
    try {
      const r = await fetchRole(user.id);
      setRole(r);
    } finally {
      setRoleLoading(false);
    }
  }, [user]);

  const needsOnboarding = authReady && !roleLoading && !!user && role === null;

  const value = useMemo(
    () => ({
      user,
      session,
      role,
      authReady,
      roleLoading,
      loading: !authReady || roleLoading,
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
      roleLoading,
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
