import { DashboardBackground } from "@/components/shared/dashboard-background";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-background md:min-h-dvh">
      <DashboardBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
