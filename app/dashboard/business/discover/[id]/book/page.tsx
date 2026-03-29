import { redirect } from "next/navigation";

function normalizePackage(value?: string) {
  if (value === "reel" || value === "post" || value === "story") {
    return value;
  }

  return null;
}

export default function LegacyBookRedirect({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { package?: string };
}) {
  const packageType = normalizePackage(searchParams?.package);
  const nextPath = packageType
    ? `/dashboard/business/discover/${params.id}?book=1&package=${packageType}`
    : `/dashboard/business/discover/${params.id}?book=1`;

  redirect(nextPath);
}
