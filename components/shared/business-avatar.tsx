"use client";

import type { BusinessIdentity } from "@/lib/business-profile";
import { cn } from "@/lib/utils";

interface BusinessAvatarProps {
  business: BusinessIdentity | null;
  name: string;
  className?: string;
  textClassName?: string;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "B"
  );
}

export function BusinessAvatar({
  business,
  name,
  className,
  textClassName,
}: BusinessAvatarProps) {
  const imageUrl =
    business?.businessProfile?.ig_profile_picture_url?.trim() || null;

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          "h-12 w-12 rounded-2xl object-cover ring-1 ring-white/10",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 font-semibold text-white/80 ring-1 ring-white/10",
        className,
      )}
    >
      <span className={cn("text-sm tracking-[0.08em]", textClassName)}>
        {getInitials(name)}
      </span>
    </div>
  );
}
