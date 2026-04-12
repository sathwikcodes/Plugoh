export default function CampaignDetailLoading() {
  return (
    <div className="container max-w-5xl space-y-5 py-6">
      <div className="h-9 w-36 animate-pulse rounded-full bg-[#211b2c]" />
      <div className="h-28 w-full animate-pulse rounded-2xl bg-[#211b2c]" />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="h-16 animate-pulse rounded-2xl bg-[#211b2c]" />
          <div className="h-40 animate-pulse rounded-2xl bg-[#211b2c]" />
        </div>
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-2xl bg-[#211b2c]" />
          <div className="h-24 animate-pulse rounded-2xl bg-[#211b2c]" />
        </div>
      </div>
    </div>
  );
}
