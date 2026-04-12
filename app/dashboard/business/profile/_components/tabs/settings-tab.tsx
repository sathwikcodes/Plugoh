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
import { LogOut, Loader2, Save, Pencil, X } from "lucide-react";
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
  const [brandLocation, setBrandLocation] = useState(
    businessProfile?.brand_location ?? profile?.location ?? "",
  );
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [editingField, setEditingField] = useState<
    "fullName" | "businessName" | "businessType" | "brandLocation" | "phone" | null
  >(null);

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

  const handleSaveField = (
    field:
      | "fullName"
      | "businessName"
      | "businessType"
      | "brandLocation"
      | "phone",
  ) => {
    const normalizedFullName = fullName.trim();
    const normalizedBusinessName = businessName.trim();

    if (!userId || !normalizedFullName || !normalizedBusinessName) {
      toast.error("Full name and business name are required");
      return;
    }

    upsertProfile.mutate(
      {
        fullName: normalizedFullName,
        businessName: normalizedBusinessName,
        businessType: businessType || undefined,
        location: brandLocation || undefined,
        brandLocation: brandLocation || undefined,
        phone: phone || undefined,
      },
      {
        onSuccess: () => setEditingField((current) => (current === field ? null : current)),
      },
    );
  };

  const cancelFieldEdit = (
    field:
      | "fullName"
      | "businessName"
      | "businessType"
      | "brandLocation"
      | "phone",
  ) => {
    if (field === "fullName") setFullName(profile?.full_name ?? "");
    if (field === "businessName") {
      setBusinessName(businessProfile?.brand_name ?? profile?.business_name ?? "");
    }
    if (field === "businessType") {
      setBusinessType(businessProfile?.brand_type ?? profile?.business_type ?? "");
    }
    if (field === "brandLocation") {
      setBrandLocation(businessProfile?.brand_location ?? profile?.location ?? "");
    }
    if (field === "phone") setPhone(profile?.phone ?? "");
    setEditingField(null);
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
              className="h-11 bg-white/3 border-white/10 text-muted-foreground"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              {editingField !== "fullName" && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditingField("fullName")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {editingField === "fullName" ? (
              <>
                <Input
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 bg-white/3 border-white/10"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => cancelFieldEdit("fullName")}
                    disabled={saving}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSaveField("fullName")}
                    disabled={saving || !fullName.trim()}
                  >
                    {saving ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-11 rounded-md border border-white/10 bg-white/3 px-3 text-sm flex items-center">
                {fullName || "-"}
              </div>
            )}
          </div>

          {/* Business Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Business Name <span className="text-destructive">*</span>
              </Label>
              {editingField !== "businessName" && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditingField("businessName")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {editingField === "businessName" ? (
              <>
                <Input
                  placeholder="Your brand or business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-11 bg-white/3 border-white/10"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => cancelFieldEdit("businessName")}
                    disabled={saving}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSaveField("businessName")}
                    disabled={saving || !businessName.trim()}
                  >
                    {saving ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-11 rounded-md border border-white/10 bg-white/3 px-3 text-sm flex items-center">
                {businessName || "-"}
              </div>
            )}
          </div>

          {/* Business Type */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Business Type
              </Label>
              {editingField !== "businessType" && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditingField("businessType")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {editingField === "businessType" ? (
              <>
                <Select
                  value={businessType}
                  onValueChange={(v) => setBusinessType(v || "")}
                >
                  <SelectTrigger className="h-11 bg-white/3 border-white/10">
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
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => cancelFieldEdit("businessType")}
                    disabled={saving}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSaveField("businessType")}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-11 rounded-md border border-white/10 bg-white/3 px-3 text-sm flex items-center">
                {businessType || "-"}
              </div>
            )}
          </div>

          {/* Brand Location */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Brand Location
              </Label>
              {editingField !== "brandLocation" && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditingField("brandLocation")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {editingField === "brandLocation" ? (
              <>
                <Input
                  placeholder="e.g. Jubilee Hills"
                  value={brandLocation}
                  onChange={(e) => setBrandLocation(e.target.value)}
                  className="h-11 bg-white/3 border-white/10"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => cancelFieldEdit("brandLocation")}
                    disabled={saving}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSaveField("brandLocation")}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-11 rounded-md border border-white/10 bg-white/3 px-3 text-sm flex items-center">
                {brandLocation || "-"}
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Phone</Label>
              {editingField !== "phone" && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditingField("phone")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {editingField === "phone" ? (
              <>
                <Input
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 bg-white/3 border-white/10"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => cancelFieldEdit("phone")}
                    disabled={saving}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSaveField("phone")}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-11 rounded-md border border-white/10 bg-white/3 px-3 text-sm flex items-center">
                {phone || "-"}
              </div>
            )}
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
