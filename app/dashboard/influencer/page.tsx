"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  X,
  Clock,
  IndianRupee,
  Inbox,
  Loader2,
  Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CampaignCards } from "@/components/shared/campaign-cards";
import { EditProfileForm } from "./_components/edit-profile-form";
import { InstagramProfileCard } from "./_components/instagram-profile-card";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];

export default function InfluencerDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [ip, setIp] = useState<InfluencerProfile | null>(null);
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from("influencer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("campaigns")
        .select("*")
        .eq("influencer_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("instagram_media")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false }),
    ]).then(([ipRes, campRes, mediaRes]) => {
      setIp(ipRes.data);
      setCampaigns(campRes.data || []);
      setMedia(mediaRes.data || []);
      setCheckingProfile(false);
    });
  }, [user]);

  useEffect(() => {
    if (!checkingProfile && !ip) {
      router.replace("/dashboard/influencer/onboarding");
    }
  }, [checkingProfile, ip, router]);

  const updateStatus = async (id: string, status: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    const { error } = await supabase
      .from("campaigns")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    );
    toast({ title: `Campaign ${status}` });

    if (campaign) {
      const notifType =
        status === "accepted"
          ? "booking_accepted"
          : status === "rejected"
            ? "booking_rejected"
            : "booking_completed";
      await supabase.from("notifications").insert({
        user_id: campaign.business_id,
        type: notifType,
        data: { title: campaign.title || "Untitled", campaign_id: campaign.id },
      });
    }
  };

  if (checkingProfile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ip) return null;

  const pending = campaigns.filter((c) => c.status === "pending");
  const active = campaigns.filter((c) => c.status === "accepted");
  const completed = campaigns.filter((c) => c.status === "completed");
  const totalEarnings = [...active, ...completed].reduce(
    (sum, c) => sum + (c.price_offered || 0),
    0,
  );

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

  const handleSync = async () => {
    if (!user || syncing) return;
    setSyncing(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Please sign in again to sync Instagram");
      }
      const res = await fetch("/api/instagram/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to sync Instagram");
      }
      const [profileRes, mediaRes] = await Promise.all([
        supabase
          .from("influencer_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("instagram_media")
          .select("*")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: false }),
      ]);
      if (profileRes.data) {
        setIp(profileRes.data);
      }
      setMedia(mediaRes.data || []);
      toast({ title: "Profile synced!" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const EmptyBookings = () => (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Inbox className="h-7 w-7 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-foreground">No booking requests yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Complete your profile to get discovered by businesses
        </p>
      </div>
    </div>
  );

  const CampaignTable = ({
    items,
    showActions,
  }: {
    items: Campaign[];
    showActions?: boolean;
  }) =>
    items.length === 0 ? (
      <EmptyBookings />
    ) : (
      <>
        <CampaignCards
          items={items}
          showActions={showActions}
          onAccept={(id) => updateStatus(id, "accepted")}
          onReject={(id) => updateStatus(id, "rejected")}
          role="influencer"
        />
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                {showActions && <TableHead>Actions</TableHead>}
                {!showActions && items[0]?.status === "accepted" && (
                  <TableHead>Contact</TableHead>
                )}
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.title || "Untitled"}
                  </TableCell>
                  <TableCell className="capitalize">
                    {c.package_type || "—"}
                  </TableCell>
                  <TableCell>
                    ₹{c.price_offered?.toLocaleString() || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor(c.status)}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateStatus(c.id, "accepted")}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(c.id, "rejected")}
                        >
                          <X className="mr-1 h-3 w-3" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  {!showActions && c.status === "accepted" && (
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <p>{c.business_contact_email}</p>
                        {c.business_contact_phone && (
                          <p>{c.business_contact_phone}</p>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/dashboard/influencer/campaigns/${c.id}`}>
                        Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Hey, {ip.display_name || profile?.full_name || "Creator"} ✨
        </h1>
        <p className="text-muted-foreground">
          Manage your bookings and profile
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-lg font-bold">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-lg font-bold">{active.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-lg font-bold">{completed.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <IndianRupee className="h-5 w-5 text-accent-foreground shrink-0" />
            <div>
              <p className="text-lg font-bold">
                ₹{totalEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full overflow-x-auto flex">
          <TabsTrigger value="pending" className="flex-1 min-w-0">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 min-w-0">
            Active ({active.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 min-w-0">
            Done ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex-1 min-w-0">
            Earnings
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 min-w-0">
            Profile
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex-1 min-w-0">
            Edit
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <Card>
            <CardContent className="p-4">
              <CampaignTable items={pending} showActions />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active">
          <Card>
            <CardContent className="p-4">
              <CampaignTable items={active} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardContent className="p-4">
              <CampaignTable items={completed} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary">
                    ₹{totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Earnings
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold">{completed.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Campaigns Completed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold">
                    {active.length + completed.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Accepted
                  </p>
                </CardContent>
              </Card>
            </div>
            {completed.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completed Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <CampaignCards items={completed} role="influencer" />
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Package</TableHead>
                          <TableHead>Earned</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completed.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">
                              {c.title || "Untitled"}
                            </TableCell>
                            <TableCell className="capitalize">
                              {c.package_type || "—"}
                            </TableCell>
                            <TableCell className="font-semibold text-primary">
                              ₹{c.price_offered?.toLocaleString() || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <InstagramProfileCard
            profile={ip}
            media={media}
            onSync={handleSync}
            isSyncing={syncing}
          />
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" /> Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EditProfileForm
                profile={ip}
                onSaved={(updated) => setIp(updated)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
