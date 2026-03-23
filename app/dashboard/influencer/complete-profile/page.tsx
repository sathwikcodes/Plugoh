"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useMyInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { useInstagramMedia } from "@/hooks/queries/use-instagram-media";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Package,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { calculateCompleteness, canGoLive } from "@/lib/profile-utils";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import {
  formReducer,
  initialFormState,
  type InfluencerProfile,
  type FormState,
} from "./_components/types";
import { StepProfile } from "./_components/step-profile";
import { StepPackages } from "./_components/step-packages";
import { StepPortfolio } from "./_components/step-portfolio";
import { StepPreview } from "./_components/step-preview";

const STEPS = [
  { id: 1, label: "Profile", icon: Sparkles },
  { id: 2, label: "Packages", icon: Package },
  { id: 3, label: "Portfolio", icon: ImageIcon },
  { id: 4, label: "Preview", icon: Eye },
];

export default function CompleteProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const initialStep = Number(searchParams.get("step")) || 1;
  const [step, setStep] = useState(
    initialStep >= 1 && initialStep <= 4 ? initialStep : 1,
  );
  const [saving, setSaving] = useState(false);
  const [formPopulated, setFormPopulated] = useState(false);

  // Form state via useReducer
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // React Query hooks for reads
  const { data: ip, isLoading: ipLoading } = useMyInfluencerProfile(user?.id);
  const { data: media = [], isLoading: mediaLoading } = useInstagramMedia(
    user?.id,
  );
  const loading = authLoading || ipLoading || mediaLoading;

  // Populate form state from query data (runs once when data arrives)
  useEffect(() => {
    if (formPopulated || !ip) return;
    dispatch({
      type: "POPULATE",
      data: {
        displayName: ip.display_name || "",
        bio: ip.bio || "",
        category: ip.category || "",
        city: ip.city || "",
        languages: ip.languages || [],
        priceReel: ip.price_per_reel?.toString() || "",
        pricePost: ip.price_per_post?.toString() || "",
        priceStory: ip.price_per_story?.toString() || "",
        contentTypes: ip.content_types || [],
        turnaroundTime: ip.turnaround_time || "",
        portfolioIds: ip.portfolio_media_ids || [],
        previousBrands: ip.previous_brands || [],
      },
    });
    setFormPopulated(true);
  }, [ip, formPopulated]);

  // tRPC mutation for writes
  const profileMutation = useMutation(
    trpc.profile.updateInfluencerProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["my-influencer-profile"] });
        queryClient.invalidateQueries({ queryKey: ["influencer-profile"] });
        queryClient.invalidateQueries({ queryKey: ["influencer-profiles"] });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message || "Save failed",
          variant: "destructive",
        });
      },
    }),
  );

  // Derive completeness + canLive directly from form state
  const { completeness, canLive } = useMemo(() => {
    const prof = {
      ...(ip as InfluencerProfile),
      display_name: formState.displayName,
      bio: formState.bio,
      category: formState.category,
      city: formState.city,
      languages: formState.languages,
      price_per_reel: Number(formState.priceReel) || null,
      price_per_post: Number(formState.pricePost) || null,
      price_per_story: Number(formState.priceStory) || null,
      content_types: formState.contentTypes,
      turnaround_time: formState.turnaroundTime,
      portfolio_media_ids: formState.portfolioIds,
      previous_brands: formState.previousBrands,
    };
    return {
      completeness: calculateCompleteness(prof),
      canLive: canGoLive(prof),
    };
  }, [ip, formState]);

  const getProfilePayload = (goLive = false) => ({
    displayName: formState.displayName,
    bio: formState.bio,
    category: formState.category,
    city: formState.city,
    languages: formState.languages,
    pricePerReel: Number(formState.priceReel) || null,
    pricePerPost: Number(formState.pricePost) || null,
    pricePerStory: Number(formState.priceStory) || null,
    contentTypes:
      formState.contentTypes.length > 0 ? formState.contentTypes : null,
    turnaroundTime: formState.turnaroundTime || null,
    portfolioMediaIds:
      formState.portfolioIds.length > 0 ? formState.portfolioIds : null,
    previousBrands:
      formState.previousBrands.length > 0 ? formState.previousBrands : null,
    ...(goLive ? { isActive: true } : {}),
  });

  const saveProgress = async () => {
    if (!ip) return;
    setSaving(true);
    try {
      await profileMutation.mutateAsync(getProfilePayload());
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveProgress();
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGoLive = async () => {
    if (!ip) return;
    if (!canLive) {
      toast({
        title: "Profile incomplete",
        description:
          "You need at least a display name, category, and one price to go live.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await profileMutation.mutateAsync(getProfilePayload(true));
      toast({
        title: ip?.is_active ? "Profile updated!" : "You're live!",
        description: ip?.is_active
          ? "Your changes have been saved."
          : "Brands can now discover your profile.",
      });
      router.push("/dashboard/influencer");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to go live";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!loading && !ip) {
      router.push("/dashboard/influencer");
    }
  }, [loading, ip, router]);

  if (loading || !ip) {
    return <PageLoadingSpinner />;
  }

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground"
          onClick={() => router.push("/dashboard/influencer")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {ip?.is_active ? "Edit Your Profile" : "Complete Your Profile"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {ip?.is_active
            ? "Update your profile details. Changes are saved automatically."
            : "We pre-filled most fields from your Instagram. Review and adjust."}
        </p>
      </div>

      {/* Completeness Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Profile completeness</span>
          <span className="font-semibold">{completeness}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              completeness >= 80
                ? "bg-green-500"
                : completeness >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500",
            )}
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (isDone || isActive) setStep(s.id);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-primary/10 text-primary cursor-pointer"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <Icon className="h-4 w-4 shrink-0" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-4 mx-1 shrink-0",
                    isDone ? "bg-primary" : "bg-secondary",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6 space-y-5">
          {step === 1 && <StepProfile state={formState} dispatch={dispatch} />}
          {step === 2 && <StepPackages state={formState} dispatch={dispatch} />}
          {step === 3 && (
            <StepPortfolio
              state={formState}
              dispatch={dispatch}
              media={media}
            />
          )}
          {step === 4 && (
            <StepPreview
              state={formState}
              ip={ip}
              media={media}
              completeness={completeness}
              canLive={canLive}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <div>
          {step > 1 && (
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => router.push("/dashboard/influencer")}
          >
            Skip for now
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleGoLive}
              disabled={saving || !canLive}
              className={ip?.is_active ? "" : "bg-green-600 hover:bg-green-700"}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ip?.is_active ? "Save Changes" : "Go Live"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
