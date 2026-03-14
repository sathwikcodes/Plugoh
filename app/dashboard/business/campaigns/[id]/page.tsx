"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  User,
  FileText,
  Package,
  IndianRupee,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

const statusColor = (s: string) => {
  switch (s) {
    case "accepted":
      return "bg-success/10 text-success border-success/20";
    case "pending":
      return "bg-warning/10 text-warning border-warning/20";
    case "rejected":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "completed":
      return "bg-primary/10 text-primary border-primary/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function BusinessCampaignDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [influencerProfile, setInfluencerProfile] =
    useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(async ({ data }) => {
        setCampaign(data);
        if (data?.influencer_profile_id) {
          const { data: ip } = await supabase
            .from("influencer_profiles")
            .select("*")
            .eq("id", data.influencer_profile_id)
            .maybeSingle();
          setInfluencerProfile(ip);
        }
        setLoading(false);
      });
  }, [id, user]);

  const updateStatus = async (status: string) => {
    if (!campaign) return;
    const { error } = await supabase
      .from("campaigns")
      .update({ status })
      .eq("id", campaign.id);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setCampaign({ ...campaign, status });
    toast({ title: `Campaign ${status}` });
    await supabase.from("notifications").insert({
      user_id: campaign.influencer_id,
      type: status === "completed" ? "booking_completed" : "booking_accepted",
      data: { title: campaign.title || "Untitled", campaign_id: campaign.id },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Campaign not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/business">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const isAccepted =
    campaign.status === "accepted" || campaign.status === "completed";

  return (
    <div className="container max-w-3xl py-6 space-y-6 animate-fade-in">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/business">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl sm:text-2xl">
              {campaign.title || "Untitled Campaign"}
            </CardTitle>
            <Badge
              variant="outline"
              className={`${statusColor(campaign.status)} text-sm`}
            >
              {campaign.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Package</p>
                <p className="font-medium capitalize">
                  {campaign.package_type || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IndianRupee className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Price Offered</p>
                <p className="font-medium">
                  ₹{campaign.price_offered?.toLocaleString() || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(campaign.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {campaign.brief && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Campaign Brief</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-4">
                {campaign.brief}
              </p>
            </div>
          )}

          {influencerProfile && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Influencer</h3>
              </div>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {influencerProfile.display_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{influencerProfile.instagram_handle}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={`/dashboard/business/influencers/${influencerProfile.id}`}
                      >
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {isAccepted && (
            <div>
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {campaign.business_contact_email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">
                        {campaign.business_contact_email}
                      </p>
                    </div>
                  </div>
                )}
                {campaign.business_contact_phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">
                        {campaign.business_contact_phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isAccepted && (
            <p className="text-sm text-muted-foreground italic">
              Contact details will be revealed once the influencer accepts.
            </p>
          )}

          {campaign.status === "accepted" && (
            <Button
              className="w-full h-12"
              variant="outline"
              onClick={() => updateStatus("completed")}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
