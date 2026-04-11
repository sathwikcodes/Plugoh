"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Loader2, Save } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { BUSINESS_TYPES } from "@/lib/constants";
import type { BusinessIdentity } from "@/lib/business-profile";

interface SettingsTabProps {
  identity: BusinessIdentity;
  userId: string;
  onSignOut: () => Promise<void>;
}

export default function BusinessSettingsTab({
  identity,
  userId,
  onSignOut,
}: SettingsTabProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { refreshUserData } = useAuth();
  const profile = identity.basicProfile;
  const businessProfile = identity.businessProfile;

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [businessName, setBusinessName] = useState(
    businessProfile?.brand_name ?? profile?.business_name ?? "",
  );
  const [businessType, setBusinessType] = useState(
    businessProfile?.brand_type ?? profile?.business_type ?? "",
  );
  const [location, setLocation] = useState(profile?.location ?? "");
  const [brandLocation, setBrandLocation] = useState(
    businessProfile?.brand_location ?? profile?.location ?? "",
  );
  const [phone, setPhone] = useState(profile?.phone ?? "");

  const upsertProfile = useMutation(
    trpc.profile.upsertBusinessProfile.mutationOptions({
      onSuccess: async () => {
        await refreshUserData();
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getMyBusinessProfile.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getMyProfile.queryKey(),
        });
        toast.success("Profile updated successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to save changes");
      },
    }),
  );

  const handleSave = () => {
    if (!userId || !businessName.trim()) return;
    upsertProfile.mutate({
      fullName: fullName || "",
      businessName: businessName.trim(),
      businessType: businessType || undefined,
      location: location || undefined,
      brandLocation: brandLocation || undefined,
      phone: phone || undefined,
    });
  };

  const handleSignOut = async () => {
    await onSignOut();
    router.push("/login");
  };

  const saving = upsertProfile.isPending;

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-4"
    >
      {/* Account / Edit Profile */}
      <m.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </p>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              value={profile?.email ?? ""}
              disabled
              className="h-11 bg-white/[0.03] border-white/10 text-muted-foreground"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 bg-white/[0.03] border-white/10"
            />
          </div>

          {/* Business Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Your brand or business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-11 bg-white/[0.03] border-white/10"
            />
          </div>

          {/* Business Type */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Business Type
            </Label>
            <Select
              value={businessType}
              onValueChange={(v) => setBusinessType(v || "")}
            >
              <SelectTrigger className="h-11 bg-white/[0.03] border-white/10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Your Place</Label>
            <Input
              placeholder="e.g. Bangalore"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-11 bg-white/[0.03] border-white/10"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Brand Location
            </Label>
            <Input
              placeholder="e.g. Jubilee Hills"
              value={brandLocation}
              onChange={(e) => setBrandLocation(e.target.value)}
              className="h-11 bg-white/[0.03] border-white/10"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Phone</Label>
            <Input
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 bg-white/[0.03] border-white/10"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !businessName.trim()}
            className="w-full h-11 bg-gradient-to-r from-[#e0348c] to-[#b02aaa] hover:brightness-110 border-0"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </m.div>

      {/* Preferences */}
      <m.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Preferences
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">
                Switch between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </m.div>

      {/* Sign Out */}
      <m.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Danger Zone
          </p>
          <Button
            variant="outline"
            className="w-full h-11 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </m.div>
    </m.div>
  );
}
