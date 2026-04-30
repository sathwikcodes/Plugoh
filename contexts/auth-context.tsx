"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
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
  const roleRequestId = useRef(0);
  const currentUserId = useRef<string | null>(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        const nextUser = data.session?.user ?? null;
        currentUserId.current = nextUser?.id ?? null;
        setSession(data.session);
        setUser(nextUser);
        setRoleLoading(!!nextUser);
        setAuthReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setRole(null);
        setRoleLoading(false);
        setAuthReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      const nextUser = nextSession?.user ?? null;
      const nextUserId = nextUser?.id ?? null;
      const userChanged = currentUserId.current !== nextUserId;
      currentUserId.current = nextUserId;

      setSession(nextSession);
      setUser(nextUser);
      setAuthReady(true);

      if (event === "SIGNED_OUT" || !nextUser) {
        setRole(null);
        setRoleLoading(false);
      } else if (userChanged) {
        setRole(null);
        setRoleLoading(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const requestId = ++roleRequestId.current;

    if (!userId) {
      setRole(null);
      setRoleLoading(false);
      return () => {
        mounted = false;
      };
    }

    const loadRole = async () => {
      setRoleLoading(true);
      try {
        const r = await fetchRole(userId);
        if (!mounted || requestId !== roleRequestId.current) return;
        setRole(r);
      } catch {
        if (!mounted || requestId !== roleRequestId.current) return;
        setRole(null);
      } finally {
        if (mounted && requestId === roleRequestId.current) {
          setRoleLoading(false);
        }
      }
    };

    void loadRole();

    return () => {
      mounted = false;
    };
  }, [userId]);

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
