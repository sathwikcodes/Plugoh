"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, X } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { statusColor } from "@/lib/format";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

interface CampaignCardsProps {
  items: Campaign[];
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  role: "business" | "influencer";
}

export function CampaignCards({
  items,
  showActions,
  onAccept,
  onReject,
  role,
}: CampaignCardsProps) {
  return (
    <div className="grid gap-3 md:hidden">
      {items.map((c) => (
        <Card key={c.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{c.title || "Untitled"}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {c.package_type || "—"}
                </p>
              </div>
              <Badge variant="outline" className={statusColor(c.status)}>
                {c.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-primary">
                ₹{c.price_offered?.toLocaleString() || "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              {showActions && (
                <>
                  <Button
                    size="sm"
                    className="flex-1 h-11"
                    onClick={() => onAccept?.(c.id)}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={() => onReject?.(c.id)}
                  >
                    <X className="mr-1 h-4 w-4" /> Reject
                  </Button>
                </>
              )}
              {!showActions && c.status === "accepted" && (
                <div className="text-xs space-y-0.5">
                  <p>{c.business_contact_email}</p>
                  {c.business_contact_phone && (
                    <p>{c.business_contact_phone}</p>
                  )}
                </div>
              )}
              <Button size="sm" variant="ghost" className="h-11" asChild>
                <Link href={`/dashboard/${role}/campaigns/${c.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
