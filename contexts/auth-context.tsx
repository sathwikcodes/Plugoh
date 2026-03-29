"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { isBusinessProfileComplete } from "@/lib/business-profile";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null;
  loading: boolean;
  needsOnboarding: boolean;
  isProfileComplete: boolean;
  signInWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<
    Database["public"]["Tables"]["profiles"]["Row"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [roleRes, profileRes] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      ]);
      const businessProfileRes =
        roleRes.data?.role === "business"
          ? await supabase
              .from("business_profiles")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle()
          : { data: null, error: null };
      if (roleRes.data) {
        setRole(roleRes.data.role);
        setNeedsOnboarding(false);
      } else {
        setRole(null);
        setNeedsOnboarding(true);
      }
      if (profileRes.data) {
        setProfile(profileRes.data);
        const r = roleRes.data?.role;
        setIsProfileComplete(
          r === "business"
            ? isBusinessProfileComplete({
                basicProfile: profileRes.data,
                businessProfile: businessProfileRes.data,
              })
            : true,
        );
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (user) await fetchUserData(user.id);
  }, [user, fetchUserData]);

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    // Use getSession() for initial load (fires synchronously from cache),
    // then let onAuthStateChange handle all subsequent updates.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      initialized = true;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id);
      }
      if (mounted) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      // Skip the initial INITIAL_SESSION event — already handled by getSession above
      if (!initialized) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setRole(null);
        setProfile(null);
        setNeedsOnboarding(false);
        setIsProfileComplete(false);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });
    if (error) throw error;
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
    setNeedsOnboarding(false);
    setIsProfileComplete(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        profile,
        loading,
        needsOnboarding,
        isProfileComplete,
        signInWithOtp,
        verifyOtp,
        signOut,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
