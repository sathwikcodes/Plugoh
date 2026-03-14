import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="animate-fade-in flex flex-col items-center space-y-6 text-center">
        <p className="text-7xl font-bold text-muted-foreground/20">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            This dashboard page doesn&apos;t exist.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
