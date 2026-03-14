"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Briefcase,
  Clock,
  CheckCircle,
  Loader2,
  Search,
  ArrowRight,
  Megaphone,
} from "lucide-react";
import { CampaignCards } from "@/components/shared/campaign-cards";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

export default function BusinessDashboard() {
  const { user, profile, isProfileComplete, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("campaigns")
      .select("*")
      .eq("business_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCampaigns(data || []);
      });
  }, [user]);

  const active = campaigns.filter((c) => c.status === "accepted").length;
  const pending = campaigns.filter((c) => c.status === "pending").length;
  const completed = campaigns.filter((c) => c.status === "completed").length;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome, {profile?.full_name || "there"} 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your campaigns and discover influencers
          </p>
        </div>
        <Button asChild className="h-12 sm:h-10">
          <Link href="/dashboard/business/influencers">
            <Search className="mr-2 h-4 w-4" /> Find Influencers
          </Link>
        </Button>
      </div>

      {!isProfileComplete && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
              <p className="text-sm font-medium">
                Complete your business profile to start booking influencers
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/onboarding">Complete Profile →</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Briefcase className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{active}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                Active
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{pending}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                Pending
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{completed}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                Completed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Table/Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Megaphone className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg text-foreground">
                  No campaigns yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Find your first influencer and start a campaign ↓
                </p>
              </div>
              <Button asChild size="lg" className="h-12">
                <Link href="/dashboard/business/influencers">
                  Browse Influencers <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <CampaignCards items={campaigns} role="business" />
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((c) => (
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
                          <Badge
                            variant="outline"
                            className={statusColor(c.status)}
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(c.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" asChild>
                            <Link
                              href={`/dashboard/business/campaigns/${c.id}`}
                            >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
