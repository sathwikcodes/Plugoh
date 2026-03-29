"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useMyBusinessProfile } from "@/hooks/queries/use-business-profiles";
import { useCampaign } from "@/hooks/queries/use-campaigns";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Pencil,
  X,
  Save,
  CircleDot,
} from "lucide-react";
import { CampaignChat } from "@/components/campaign/campaign-chat";
import { useToast } from "@/hooks/use-toast";
import { statusColor } from "@/lib/format";
import { getBusinessDisplayName } from "@/lib/business-profile";

const STATUS_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
];

function StatusTimeline({ status }: { status: string }) {
  const isRejected = status === "rejected";
  const currentIndex = isRejected
    ? -1
    : STATUS_STEPS.findIndex((s) => s.key === status);

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20">
          <X className="h-4 w-4 text-destructive" />
        </div>
        <span className="text-sm font-medium text-destructive">Rejected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 py-3 overflow-x-auto">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isCompleted ? "bg-success/20" : "bg-muted"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle
                    className={`h-4 w-4 ${
                      isCurrent ? "text-success" : "text-success/70"
                    }`}
                  />
                ) : (
                  <CircleDot className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                  isCompleted ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 sm:w-12 mx-1 mt-[-16px] ${
                  i < currentIndex ? "bg-success/50" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function BusinessCampaignDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { user, profile } = useAuth();
  const { data: identity } = useMyBusinessProfile(user?.id);
  const { toast } = useToast();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading: campaignLoading } = useCampaign(
    id,
    user?.id,
  );
  const { data: influencerProfile } = useInfluencerProfile(
    campaign?.influencer_profile_id ?? undefined,
  );

  // Edit state (UI-only)
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBrief, setEditBrief] = useState("");

  const statusMutation = useMutation(
    trpc.campaign.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["campaign"] });
        queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
        queryClient.invalidateQueries({
          queryKey: ["business-inbox-conversations"],
        });
        toast({ title: "Campaign updated" });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  const editMutation = useMutation(
    trpc.campaign.editCampaign.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["campaign", id] });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        setIsEditing(false);
        toast({ title: "Campaign updated" });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  const updateStatus = (status: string) => {
    statusMutation.mutate({
      campaignId: id,
      status: status as "accepted" | "rejected" | "completed",
    });
  };

  const startEditing = () => {
    if (!campaign) return;
    setEditTitle(campaign.title || "");
    setEditBrief(campaign.brief || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEdits = () => {
    if (!campaign) return;
    editMutation.mutate({
      campaignId: campaign.id,
      title: editTitle,
      brief: editBrief,
    });
  };

  if (campaignLoading) {
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
  const isPending = campaign.status === "pending";
  const saving = editMutation.isPending;

  return (
    <div className="container max-w-3xl py-6 space-y-6 animate-fade-in">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/business/campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
        </Link>
      </Button>

      {/* Status Timeline */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Campaign Status</p>
          <StatusTimeline status={campaign.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xl font-bold h-11"
                placeholder="Campaign title"
              />
            ) : (
              <CardTitle className="text-xl sm:text-2xl">
                {campaign.title || "Untitled Campaign"}
              </CardTitle>
            )}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${statusColor(campaign.status)} text-sm`}
              >
                {campaign.status}
              </Badge>
              {isPending && !isEditing && (
                <Button variant="ghost" size="icon" onClick={startEditing}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campaign details grid */}
          <div className="grid gap-4 sm:grid-cols-3">
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

          {/* Brief section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Campaign Brief</h3>
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editBrief}
                  onChange={(e) => setEditBrief(e.target.value)}
                  placeholder="Describe your campaign requirements..."
                  rows={5}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={saveEdits}
                    disabled={saving}
                    className="h-10"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                    className="h-10"
                  >
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </div>
              </div>
            ) : campaign.brief ? (
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-4 whitespace-pre-wrap">
                {campaign.brief}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No brief provided.
                {isPending && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={startEditing}
                    className="ml-1 h-auto p-0"
                  >
                    Add one
                  </Button>
                )}
              </p>
            )}
          </div>

          {/* Influencer info */}
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
                        href={`/dashboard/business/discover/${influencerProfile.id}`}
                      >
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contact info */}
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

          {!isAccepted && campaign.status !== "rejected" && (
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

      {/* Campaign Chat */}
      {campaign.status !== "rejected" && (
        <CampaignChat
          campaignId={campaign.id}
          businessId={campaign.business_id}
          influencerId={campaign.influencer_id}
          businessName={
            getBusinessDisplayName(
              identity ?? { basicProfile: profile, businessProfile: null },
            )
          }
          influencerName={influencerProfile?.display_name || "Influencer"}
          disabled={campaign.status === "completed"}
        />
      )}
    </div>
  );
}
