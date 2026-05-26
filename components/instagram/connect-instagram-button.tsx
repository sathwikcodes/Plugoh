"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import type { AppRole } from "@/lib/auth-routing";
import { cn } from "@/lib/utils";

export function ConnectInstagramButton({
  role,
  className,
}: {
  role: AppRole;
  className?: string;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/instagram/connect?userId=${encodeURIComponent(user.id)}&role=${role}`,
      );
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Failed to start Instagram OAuth");
      }
      window.location.href = data.url;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not connect Instagram";
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleConnect()}
      disabled={loading || !user}
      className={cn(
        "mt-3 w-full rounded-xl bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50",
        className,
      )}
    >
      {loading ? "Opening Instagram…" : "Connect Instagram"}
    </button>
  );
}
