"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { supabase } from "@/lib/supabase/client";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Instagram,
  Users,
  Eye,
  Heart,
  MapPin,
  Globe,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

const PACKAGE_TYPES = ["reel", "post", "story", "reel+story", "reel+post"];

export default function InfluencerProfileView() {
  const params = useParams();
  const id = params?.id as string;
  const { user, profile: myProfile } = useAuth();
  const { toast } = useToast();
  const [ip, setIp] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [packageType, setPackageType] = useState("reel");
  const [priceOffered, setPriceOffered] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    if (!id) return;
    supabase
      .from("influencer_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setIp(data);
        if (data?.price_per_reel)
          setPriceOffered(data.price_per_reel.toString());
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (myProfile) {
      setContactEmail(myProfile.email || "");
      setContactPhone(myProfile.phone || "");
    }
  }, [myProfile]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !ip) return;
    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Please sign in again");

      const priceNum = Number(priceOffered);
      if (!priceNum || priceNum <= 0) throw new Error("Invalid price");

      // Step 1: Create Razorpay order (server-side)
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: priceNum,
          receipt: `r_${user.id.slice(0, 8)}_${Date.now()}`,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(orderData.error ?? "Failed to create order");

      // Step 2: Open Razorpay checkout
      const rzpOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ReelReach",
        description: `Campaign: ${title}`,
        order_id: orderData.orderId,
        prefill: { email: contactEmail, contact: contactPhone },
        theme: { color: "#6366f1" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3: Verify payment + create campaign (server-side)
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              campaignData: {
                influencer_id: ip.user_id,
                influencer_profile_id: ip.id,
                title,
                brief,
                package_type: packageType,
                price_offered: priceNum,
                business_contact_email: contactEmail,
                business_contact_phone: contactPhone,
              },
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            toast({
              title: "Payment verification failed",
              description: verifyData.error,
              variant: "destructive",
            });
            return;
          }
          toast({
            title: "Booking confirmed!",
            description:
              "Payment received. The creator will review your request.",
          });
          setBookingOpen(false);
          setTitle("");
          setBrief("");
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      toast({ title: "Error", description: message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ip) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Influencer not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/business/influencers">Back to Discovery</Link>
        </Button>
      </div>
    );
  }

  const formatNum = (n: number | null) => {
    if (!n) return "—";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <div className="container max-w-3xl py-6 space-y-6 animate-fade-in">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/business/influencers">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {ip.display_name || "Creator"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                {ip.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {ip.city}
                  </span>
                )}
                {ip.category && (
                  <Badge variant="secondary">{ip.category}</Badge>
                )}
                {ip.languages && ip.languages.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {ip.languages.join(", ")}
                  </span>
                )}
              </div>
            </div>
            {ip.instagram_handle && (
              <a
                href={
                  ip.instagram_url ||
                  `https://instagram.com/${ip.instagram_handle}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Instagram className="h-4 w-4" /> @{ip.instagram_handle}
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-secondary p-4 text-center">
              <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-xl font-bold">
                {formatNum(ip.follower_count)}
              </p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-center">
              <Eye className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-xl font-bold">
                {formatNum(ip.avg_views_per_reel)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Views</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-center">
              <Heart className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-xl font-bold">
                {formatNum(ip.avg_likes_per_reel)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Likes</p>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="font-semibold mb-3">Pricing</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Reel</TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{ip.price_per_reel?.toLocaleString() || "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Post</TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{ip.price_per_post?.toLocaleString() || "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Story</TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{ip.price_per_story?.toLocaleString() || "—"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Bio */}
          {ip.bio && (
            <div>
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ip.bio}
              </p>
            </div>
          )}

          {/* Book CTA */}
          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogTrigger>
              <Button size="lg" className="w-full">
                Book this Influencer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Book {ip.display_name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Campaign Title</Label>
                  <Input
                    placeholder="e.g. New menu launch"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brief</Label>
                  <Textarea
                    placeholder="Describe what you need..."
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Package Type</Label>
                  <Select
                    value={packageType}
                    onValueChange={(v) => v && setPackageType(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PACKAGE_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price Offered (₹)</Label>
                  <Input
                    type="number"
                    value={priceOffered}
                    onChange={(e) => setPriceOffered(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Your Email</Label>
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Your Phone</Label>
                    <Input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Pay & Book (₹{Number(priceOffered || 0).toLocaleString()})
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
