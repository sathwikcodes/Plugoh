"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { useUpdateInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { toast } from "sonner";

interface SettingsTabProps {
  userId: string;
  onSignOut: () => Promise<void>;
}

export default function SettingsTab({
  userId,
  onSignOut,
}: SettingsTabProps) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const router = useRouter();
  const updateProfile = useUpdateInfluencerProfile();

  const handleToggleActive = async (active: boolean) => {
    try {
      await updateProfile.mutateAsync({
        userId,
        data: { is_active: active },
      });
      toast.success(
        active
          ? "Profile is now visible to brands"
          : "Profile hidden from brands",
      );
    } catch {
      toast.error("Failed to update. Please try again.");
    }
  };

  const handleSignOut = async () => {
    await onSignOut();
    router.push("/login");
  };

  return (
    <>
      <m.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-4 pt-4"
      >

        {/* Account */}
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </p>
            <Button
              variant="outline"
              className="w-full h-11 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </m.div>
      </m.div>

      <AlertDialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide your profile?</AlertDialogTitle>
            <AlertDialogDescription>
              Brands won&apos;t be able to discover you while your profile is
              hidden. You can turn it back on anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleToggleActive(false)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Hide Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
