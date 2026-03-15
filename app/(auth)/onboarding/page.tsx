"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Briefcase, Sparkles, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function Onboarding() {
  const {
    user,
    role,
    profile,
    loading: authLoading,
    refreshUserData,
  } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<AppRole>("business");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const instagramRedirectInProgress = useRef(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    else if (user?.user_metadata?.name)
      setFullName(user.user_metadata.name as string);
  }, [profile, user]);

  useEffect(() => {
    if (instagramRedirectInProgress.current) return;
    if (!authLoading && !user) {
      router.replace("/login");
    } else if (!authLoading && role) {
      router.replace(
        role === "influencer" ? "/dashboard/influencer" : "/dashboard/business",
      );
    }
  }, [authLoading, user, role, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: selectedRole });
      if (roleError) throw roleError;

      const profileUpdate: Database["public"]["Tables"]["profiles"]["Update"] =
        { full_name: fullName, phone: phone || null };

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);
      if (profileError) throw profileError;

      if (selectedRole === "influencer") {
        const { error: ipError } = await supabase
          .from("influencer_profiles")
          .insert({
            user_id: user.id,
            display_name: fullName,
            is_active: false,
          });
        if (ipError && ipError.code !== "23505") throw ipError;
      }

      toast({ title: "Profile set up!", description: "Welcome to ReelReach." });

      if (selectedRole === "influencer") {
        const res = await fetch(
          `/api/instagram/connect?userId=${encodeURIComponent(user.id)}`,
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error ?? "Failed to start Instagram OAuth");
        instagramRedirectInProgress.current = true;
        window.location.href = data.url;
      } else {
        await refreshUserData();
        router.push("/dashboard/business");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Setup failed";
      toast({
        title: "Setup failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted" />

      {/* Right panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Welcome to ReelReach!</h1>
            <p className="text-sm text-muted-foreground">
              Tell us who you are to get started.
            </p>
          </div>

          <Tabs
            defaultValue="business"
            onValueChange={(v) => setSelectedRole(v as AppRole)}
          >
            <TabsList className="w-full h-12 rounded-xl">
              <TabsTrigger
                value="business"
                className="flex-1 h-full rounded-lg gap-2 text-sm font-medium"
              >
                <Briefcase className="h-4 w-4" />
                Business Owner
              </TabsTrigger>
              <TabsTrigger
                value="influencer"
                className="flex-1 h-full rounded-lg gap-2 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Influencer
              </TabsTrigger>
            </TabsList>

            {/* Business Owner form */}
            <TabsContent value="business" className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ob-name">Full Name</Label>
                  <Input
                    id="ob-name"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-phone">Phone Number</Label>
                  <Input
                    id="ob-phone"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Get Started
                </Button>
              </form>
            </TabsContent>

            {/* Influencer form */}
            <TabsContent value="influencer" className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inf-name">Full Name</Label>
                  <Input
                    id="inf-name"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inf-phone">Phone Number</Label>
                  <Input
                    id="inf-phone"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold bg-linear-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Instagram className="mr-2 h-5 w-5" />
                  )}
                  Connect with Instagram
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
