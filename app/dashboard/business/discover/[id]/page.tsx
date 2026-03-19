"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { supabase } from "@/lib/supabase/client";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { usePortfolioMedia } from "@/hooks/queries/use-instagram-media";

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
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/format";
import { PACKAGE_TYPES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

const BRIEF_TEMPLATES: { label: string; template: string }[] = [
  {
    label: "Product Review",
    template:
      "Product/Service:\nKey Message:\nDos:\nDon'ts:\nDelivery Deadline:",
  },
  {
    label: "Restaurant Visit",
    template:
      "Restaurant/Location:\nDishes to Feature:\nVibe/Atmosphere to Highlight:\nDos:\nDon'ts:\nDelivery Deadline:",
  },
  {
    label: "Unboxing",
    template:
      "Product:\nKey Features to Highlight:\nUnboxing Style (casual/detailed):\nDos:\nDon'ts:\nDelivery Deadline:",
  },
  {
    label: "Brand Mention",
    template:
      "Brand/Product:\nKey Talking Points:\nIntegration Style (organic/dedicated):\nDos:\nDon'ts:\nDelivery Deadline:",
  },
];

export default function InfluencerProfileView() {
  const params = useParams();
  const id = params?.id as string;
  const { user, profile: myProfile, isProfileComplete } = useAuth();
  const { toast } = useToast();

  const { data: ip, isLoading: profileLoading } = useInfluencerProfile(id);
  const { data: portfolioMedia } = usePortfolioMedia(
    ip?.user_id,
    ip?.portfolio_media_ids,
  );

  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [packageType, setPackageType] = useState("reel");
  const [priceOffered, setPriceOffered] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Set default price when profile loads
  useEffect(() => {
    if (ip?.price_per_reel && !priceOffered) {
      setPriceOffered(ip.price_per_reel.toString());
    }
  }, [ip, priceOffered]);

  useEffect(() => {
    if (myProfile) {
      setContactEmail(myProfile.email || "");
      setContactPhone(myProfile.phone || "");
    }
  }, [myProfile]);

  const loading = profileLoading;

  // Get listed price based on selected package type
  const getListedPrice = (pkg: string): number | null => {
    if (!ip) return null;
    if (pkg === "reel" || pkg === "reel+story" || pkg === "reel+post")
      return ip.price_per_reel;
    if (pkg === "post") return ip.price_per_post;
    if (pkg === "story") return ip.price_per_story;
    return ip.price_per_reel;
  };

  const listedPrice = getListedPrice(packageType);

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
          <Link href="/dashboard/business/discover">Back to Discovery</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 space-y-6 animate-fade-in">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/business/discover">
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
                {formatNumber(ip.follower_count)}
              </p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-center">
              <Eye className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-xl font-bold">
                {formatNumber(ip.avg_views_per_reel)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Views</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-center">
              <Heart className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-xl font-bold">
                {formatNumber(ip.avg_likes_per_reel)}
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

          {/* Content Types */}
          {ip.content_types && ip.content_types.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Content Types</h2>
              <div className="flex flex-wrap gap-1.5">
                {ip.content_types.map((ct) => (
                  <Badge key={ct} variant="outline">
                    {ct}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Turnaround Time */}
          {ip.turnaround_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Typical delivery:{" "}
              {ip.turnaround_time
                .replace(/_/g, " ")
                .replace(/(\d)(\d)/, "$1-$2")}
            </div>
          )}

          {/* Bio */}
          {ip.bio && (
            <div>
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ip.bio}
              </p>
            </div>
          )}

          {/* Portfolio Highlights */}
          {portfolioMedia && portfolioMedia.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Portfolio Highlights</h2>
              <div className="grid grid-cols-3 gap-2">
                {portfolioMedia.map((item) => {
                  const imgSrc = item.thumbnail_url || item.media_url;
                  return (
                    <div
                      key={item.ig_media_id}
                      className="aspect-square rounded-lg overflow-hidden bg-secondary"
                    >
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={item.caption?.slice(0, 50) || "Portfolio"}
                          fill
                          sizes="(max-width: 768px) 33vw, 200px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Previous Brands */}
          {ip.previous_brands && ip.previous_brands.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Worked With</h2>
              <div className="flex flex-wrap gap-1.5">
                {ip.previous_brands.map((brand) => (
                  <Badge key={brand} variant="secondary">
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Book CTA */}
          {!isProfileComplete && (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4 text-center space-y-2">
              <p className="text-sm font-medium">
                Complete your business profile to book influencers
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/business/profile">Complete Profile</Link>
              </Button>
            </div>
          )}
          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogTrigger>
              <Button
                size="lg"
                className="w-full"
                disabled={!isProfileComplete}
                onClick={(e) => {
                  if (!isProfileComplete) e.preventDefault();
                }}
              >
                {isProfileComplete
                  ? "Book this Influencer"
                  : "Complete profile to book"}
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
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {BRIEF_TEMPLATES.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setBrief(t.template)}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Describe what you need..."
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    required
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Package Type</Label>
                  <Select
                    value={packageType}
                    onValueChange={(v) => {
                      if (!v) return;
                      setPackageType(v);
                      const price = getListedPrice(v);
                      if (price) setPriceOffered(price.toString());
                    }}
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
                  <div className="flex items-center justify-between">
                    <Label>Price Offered (₹)</Label>
                    {listedPrice && (
                      <span className="text-[11px] text-muted-foreground">
                        Listed: ₹{listedPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
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
