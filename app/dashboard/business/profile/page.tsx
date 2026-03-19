"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BUSINESS_TYPES } from "@/lib/constants";

export default function BusinessSettings() {
  const { user, profile, loading: authLoading, refreshUserData } = useAuth();
  const { toast } = useToast();
  const trpc = useTRPC();

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBusinessName(profile.business_name || "");
      setBusinessType(profile.business_type || "");
      setLocation(profile.location || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const upsertProfile = useMutation(
    trpc.profile.upsertBusinessProfile.mutationOptions({
      onSuccess: async () => {
        await refreshUserData();
        toast({
          title: "Profile updated",
          description: "Your changes have been saved.",
        });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to save",
          variant: "destructive",
        });
      },
    }),
  );

  const handleSave = () => {
    if (!user || !businessName.trim()) return;
    upsertProfile.mutate({
      fullName: fullName || "",
      businessName: businessName.trim(),
      businessType: businessType || undefined,
      location: location || undefined,
      phone: phone || undefined,
    });
  };

  const saving = upsertProfile.isPending;

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-11 w-11">
          <Link href="/dashboard/business">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Business Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your brand details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile?.email || ""}
              disabled
              className="h-11 bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="businessName"
              placeholder="Your brand or business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select
              value={businessType}
              onValueChange={(v) => setBusinessType(v || "")}
            >
              <SelectTrigger className="h-11">
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

          <div className="space-y-2">
            <Label htmlFor="location">City / Location</Label>
            <Input
              id="location"
              placeholder="e.g. Hyderabad"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !businessName.trim()}
            className="w-full h-11"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
