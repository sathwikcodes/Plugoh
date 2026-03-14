import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="animate-fade-in flex flex-col items-center space-y-6 text-center">
        <p className="text-8xl font-bold text-muted-foreground/20">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
