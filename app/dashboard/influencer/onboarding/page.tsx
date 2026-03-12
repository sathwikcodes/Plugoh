"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InfluencerOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/instagram/connect?userId=${encodeURIComponent(user.id)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start OAuth");
      window.location.href = data.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      toast({ title: "Error", description: message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-lg py-12 animate-fade-in">
      <Card>
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
            <Instagram className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Connect your Instagram</CardTitle>
          <CardDescription>
            We&apos;ll automatically import your profile and content data — no
            manual entry needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Instagram className="h-4 w-4" />
            )}
            Connect with Instagram
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Your account must be a <strong>Creator or Business</strong> account.
            Personal accounts are not supported.
          </p>
          <div className="text-center">
            <Link
              href="/dashboard/influencer"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Skip for now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
