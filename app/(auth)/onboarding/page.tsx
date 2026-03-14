"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Briefcase, Sparkles, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const BUSINESS_TYPES = [
  "restaurant",
  "retail",
  "service",
  "agency",
  "ecommerce",
  "other",
];

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

  const [step, setStep] = useState<"role" | "profile">("role");
  const [selectedRole, setSelectedRole] = useState<AppRole>("business");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    else if (user?.user_metadata?.name)
      setFullName(user.user_metadata.name as string);
  }, [profile, user]);

  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: selectedRole });
      if (roleError) throw roleError;

      const profileUpdate: Database["public"]["Tables"]["profiles"]["Update"] =
        { full_name: fullName, phone, location };

      if (selectedRole === "business") {
        profileUpdate.business_name = businessName || null;
        profileUpdate.business_type = businessType || null;
      }

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
            city: location || null,
            is_active: false,
          });
        if (ipError && ipError.code !== "23505") throw ipError;
      }

      await refreshUserData();

      toast({ title: "Profile set up!", description: "Welcome to ReelReach." });

      if (selectedRole === "influencer") {
        router.push("/dashboard/influencer/onboarding");
      } else {
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {step === "role"
              ? "Welcome to ReelReach!"
              : "Complete your profile"}
          </CardTitle>
          <CardDescription>
            {step === "role"
              ? "Tell us who you are to get started"
              : "Just a few more details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "role" ? (
            <div className="space-y-6">
              <RadioGroup
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as AppRole)}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="onboard-role-business"
                  className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${
                    selectedRole === "business"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <RadioGroupItem
                    value="business"
                    id="onboard-role-business"
                    className="sr-only"
                  />
                  <Briefcase className="h-8 w-8 text-primary" />
                  <span className="font-medium">Business</span>
                  <span className="text-xs text-muted-foreground text-center">
                    I want to book influencers
                  </span>
                </Label>
                <Label
                  htmlFor="onboard-role-influencer"
                  className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${
                    selectedRole === "influencer"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <RadioGroupItem
                    value="influencer"
                    id="onboard-role-influencer"
                    className="sr-only"
                  />
                  <Sparkles className="h-8 w-8 text-primary" />
                  <span className="font-medium">Influencer</span>
                  <span className="text-xs text-muted-foreground text-center">
                    I want brand deals
                  </span>
                </Label>
              </RadioGroup>
              <Button onClick={() => setStep("profile")} className="w-full">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="onboard-name">Full Name</Label>
                <Input
                  id="onboard-name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {selectedRole === "business" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="onboard-business-name">Business Name</Label>
                    <Input
                      id="onboard-business-name"
                      placeholder="e.g. Spice Garden Restaurant"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onboard-business-type">
                      Business Type (optional)
                    </Label>
                    <Select
                      value={businessType}
                      onValueChange={(v) => setBusinessType(v ?? "")}
                    >
                      <SelectTrigger id="onboard-business-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="onboard-phone">Phone (optional)</Label>
                <Input
                  id="onboard-phone"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboard-location">Location (optional)</Label>
                <Input
                  id="onboard-location"
                  placeholder="e.g. Hyderabad, Telangana"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Started
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("role")}
              >
                Back
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
