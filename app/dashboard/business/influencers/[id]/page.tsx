import { redirect } from "next/navigation";

export default function InfluencerProfileRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/dashboard/business/discover/${params.id}`);
}
