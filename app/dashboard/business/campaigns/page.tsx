"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
  Loader2,
  Megaphone,
  ArrowRight,
  Search,
} from "lucide-react";
import { CampaignCards } from "@/components/shared/campaign-cards";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { statusColor } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_FILTERS = [
  "All",
  "pending",
  "accepted",
  "completed",
  "rejected",
] as const;

export default function CampaignsList() {
  const { user, loading: authLoading } = useAuth();
  const { data: campaigns = [], isLoading } = useCampaigns(
    user?.id,
    "business",
  );
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...campaigns];
    if (statusFilter !== "All") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => (c.title || "").toLowerCase().includes(q));
    }
    return result;
  }, [campaigns, statusFilter, search]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-11 w-11">
          <Link href="/dashboard/business">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">My Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage all your campaigns
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {statusFilter === s && (
                  <motion.div
                    layoutId="activeStatusPill"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span
                  className={`relative z-10 capitalize ${
                    statusFilter === s
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s === "All" ? "All" : s}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by campaign title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Result count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Campaign list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Megaphone className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {campaigns.length === 0
                  ? "No campaigns yet"
                  : "No campaigns match your filters"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {campaigns.length === 0
                  ? "Find your first influencer and start a campaign"
                  : "Try different filters or clear your search"}
              </p>
            </div>
            {campaigns.length === 0 ? (
              <Button asChild size="lg" className="h-12">
                <Link href="/dashboard/business/influencers">
                  Browse Influencers <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("All");
                  setSearch("");
                }}
                className="h-11"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <CampaignCards items={filtered} role="business" />
          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
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
                  <AnimatePresence>
                    {filtered.map((c) => (
                      <motion.tr
                        key={c.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
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
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
