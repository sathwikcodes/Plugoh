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
import { isBusinessProfileComplete } from "@/lib/business-profile";
import { getPreferredAvatarUrl } from "@/lib/avatar-utils";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null;
  avatarUrl: string | null;
  loading: boolean;
  error: string | null;
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const fetchUserData = useCallback(async (authUser: User) => {
    try {
      setError(null);
      const userId = authUser.id;
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
              .select("*, ig_profile_picture_url")
              .eq("user_id", userId)
              .maybeSingle()
          : { data: null, error: null };
      const influencerProfileRes =
        roleRes.data?.role === "influencer"
          ? await supabase
              .from("influencer_profiles")
              .select("ig_profile_picture_url")
              .eq("user_id", userId)
              .maybeSingle()
          : { data: null, error: null };

      const instagramAvatarUrl =
        roleRes.data?.role === "business"
          ? businessProfileRes.data?.ig_profile_picture_url
          : roleRes.data?.role === "influencer"
            ? influencerProfileRes.data?.ig_profile_picture_url
            : null;
      setAvatarUrl(
        getPreferredAvatarUrl({
          instagramAvatarUrl,
          user: authUser,
        }),
      );

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
      } else {
        setProfile(null);
        setIsProfileComplete(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch user data";
      setError(message);
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (user) await fetchUserData(user);
  }, [user, fetchUserData]);

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      initialized = true;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await fetchUserData(s.user);
      }
      if (mounted) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted || !initialized) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await fetchUserData(s.user);
      } else {
        setRole(null);
        setProfile(null);
        setAvatarUrl(null);
        setNeedsOnboarding(false);
        setIsProfileComplete(false);
        setError(null);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

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
    setProfile(null);
    setAvatarUrl(null);
    setNeedsOnboarding(false);
    setIsProfileComplete(false);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      role,
      profile,
      avatarUrl,
      loading,
      error,
      needsOnboarding,
      isProfileComplete,
      signInWithOtp,
      verifyOtp,
      signOut,
      refreshUserData,
    }),
    [
      user,
      session,
      role,
      profile,
      avatarUrl,
      loading,
      error,
      needsOnboarding,
      isProfileComplete,
      signInWithOtp,
      verifyOtp,
      signOut,
      refreshUserData,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
