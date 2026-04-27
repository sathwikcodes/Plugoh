"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useMyProfile } from "@/hooks/queries/use-my-identity";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuthTheme } from "@/components/auth/theme-context";
import { cn } from "@/lib/utils";
import PhoneInput from "@/components/ui/phone-input";
import { BUSINESS_TYPES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_TABS = [
  {
    role: "business" as AppRole,
    label: "Brand",
    description: "Find and collaborate with top influencers for your brand",
    videoUrl:
      "https://a0.muscache.com/videos/search-bar-icons/webm/house-selected.webm",
    initialRenderUrl:
      "https://a0.muscache.com/videos/search-bar-icons/webm/house-twirl-selected.webm",
  },
  {
    role: "influencer" as AppRole,
    label: "Influencer",
    description: "Showcase your content and land brand deals",
    videoUrl:
      "https://a0.muscache.com/videos/search-bar-icons/webm/consierge-selected.webm",
    initialRenderUrl:
      "https://a0.muscache.com/videos/search-bar-icons/webm/consierge-twirl.webm",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

function OnboardingInner() {
  const { user, role, authReady, refreshRole } = useAuth();
  const { data: profile } = useMyProfile();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const authLoading = !authReady;
  const { toast } = useToast();
  const router = useRouter();
  const { setTheme } = useAuthTheme();

  const searchParams = useSearchParams();

  const [selectedRole, setSelectedRole] = useState<AppRole | null>(
    "influencer",
  );
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandType, setBrandType] = useState("");
  const [brandLocation, setBrandLocation] = useState("");
  const [businessInstagramChoice, setBusinessInstagramChoice] = useState<
    "yes" | "no" | null
  >(null);
  const [manualBusinessFlow, setManualBusinessFlow] = useState(false);
  const [loading, setLoading] = useState(false);
  const instagramRedirectInProgress = useRef(false);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [tabClicked, setTabClicked] = useState(false);

  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, ROLE_TABS.length);
  }, []);

  useEffect(() => {
    setTheme("influencer");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    else if (user?.user_metadata?.name)
      setFullName(user.user_metadata.name as string);
  }, [profile, user]);

  useEffect(() => {
    if (profile?.phone) setPhone(profile.phone);
    if (profile?.location) setPlace(profile.location);
    if (profile?.business_name) setBrandName(profile.business_name);
    if (profile?.business_type) setBrandType(profile.business_type);
  }, [profile]);

  useEffect(() => {
    if (!brandLocation.trim() && place.trim()) {
      setBrandLocation(place);
    }
  }, [brandLocation, place]);

  useEffect(() => {
    if (instagramRedirectInProgress.current) return;
    if (!authLoading && !user) {
      router.replace("/login");
    } else if (!authLoading && role) {
      router.replace(
        role === "influencer" ? "/dashboard/influencer" : "/dashboard/business",
      );
    }
  }, [authLoading, user, role, router]);

  useEffect(() => {
    const err = searchParams.get("error");
    if (!err) return;
    const messages: Record<string, string> = {
      instagram_denied: "Instagram access was denied. Please try again.",
      missing_params: "Something went wrong with the Instagram connection.",
      invalid_state: "Session expired. Please try again.",
      server_error: "A server error occurred. Please try again.",
    };
    toast({
      title: "Instagram connection failed",
      description: messages[err] ?? "An unexpected error occurred.",
      variant: "destructive",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleRoleSelect = (r: AppRole, index: number) => {
    setTabClicked(true);
    setSelectedRole(r);
    setTheme(r === "influencer" ? "influencer" : "brand");
    setBusinessInstagramChoice(null);
    setManualBusinessFlow(false);

    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    const videoElement = videoRefs.current[index];
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.play();
    }
  };

  const upsertCommonProfile = async () => {
    if (!user || !selectedRole) return null;

    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert(
        { user_id: user.id, role: selectedRole },
        { onConflict: "user_id" },
      );
    if (roleError) throw roleError;

    const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
      id: user.id,
      email: user.email ?? null,
      full_name: fullName,
      phone: phone || null,
      location: place || null,
      ...(selectedRole === "business" &&
        manualBusinessFlow && {
          business_name: brandName.trim(),
          business_type: brandType || null,
        }),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const upsertBusinessProfile = async ({ shellOnly = false } = {}) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("business_profiles")
      .upsert(
        {
          user_id: user.id,
          has_instagram_account: businessInstagramChoice === "yes",
          ...(shellOnly
            ? {}
            : {
                brand_name: brandName.trim() || null,
                brand_type: brandType || null,
                brand_location: brandLocation || place || null,
              }),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const handleInfluencerSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!user || selectedRole !== "influencer") return;
    setLoading(true);

    try {
      await upsertCommonProfile();

      const { error: ipError } = await supabase
        .from("influencer_profiles")
        .insert({
          user_id: user.id,
          display_name: fullName,
          city: place || null,
          is_active: false,
        });
      if (ipError && ipError.code !== "23505") throw ipError;

      toast({ title: "Profile set up!", description: "Welcome to Plugoh." });

      const res = await fetch(
        `/api/instagram/connect?userId=${encodeURIComponent(user.id)}&role=influencer`,
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? "Failed to start Instagram OAuth");
      instagramRedirectInProgress.current = true;
      window.location.href = data.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Setup failed";
      toast({
        title: "Setup failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessContinue = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!user || selectedRole !== "business") return;
    setLoading(true);

    try {
      await upsertCommonProfile();
      await upsertBusinessProfile();

      toast({ title: "Profile set up!", description: "Welcome to Plugoh." });
      await Promise.all([
        refreshRole(),
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getMyProfile.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getMyBusinessProfile.queryKey(),
        }),
      ]);
      router.replace("/dashboard/business/profile?source=onboarding");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Setup failed";
      toast({
        title: "Setup failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessInstagramConnect = async () => {
    if (!user || selectedRole !== "business") return;
    setLoading(true);

    try {
      await upsertCommonProfile();
      await upsertBusinessProfile({ shellOnly: true });

      const res = await fetch(
        `/api/instagram/connect?userId=${encodeURIComponent(user.id)}&role=business`,
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? "Failed to start Instagram OAuth");
      instagramRedirectInProgress.current = true;
      window.location.href = data.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Setup failed";
      toast({
        title: "Setup failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const showManualBusinessFields =
    selectedRole === "business" &&
    (businessInstagramChoice === "no" || manualBusinessFlow);
  const canConnectBusinessInstagram =
    selectedRole === "business" &&
    businessInstagramChoice === "yes" &&
    !!fullName.trim() &&
    !!phone.trim() &&
    !!place.trim();

  return (
    <AuthShell hideLogo>
      <m.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <m.div variants={fadeUp} className="text-center">
          <p
            className="text-lg font-semibold"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            Tell us who you are to get started.
          </p>
        </m.div>

        <m.div variants={fadeUp} className="space-y-4">
          <div
            className="flex justify-center rounded-2xl p-1"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {ROLE_TABS.map((tab, index) => (
              <m.button
                key={tab.role}
                type="button"
                whileTap="tapped"
                whileHover="hovered"
                onClick={() => handleRoleSelect(tab.role, index)}
                className="relative flex items-center gap-2 cursor-pointer outline-none flex-1 justify-center transition-all duration-200"
                style={{
                  WebkitTapHighlightColor: "transparent",
                  background:
                    selectedRole === tab.role
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                  borderRadius: "0.75rem",
                  padding: "0.5rem 1rem",
                }}
              >
                <m.div
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    transition: {
                      type: "spring",
                      bounce: 0.2,
                      damping: 7,
                      duration: 0.4,
                      delay: index * 0.1,
                    },
                  }}
                  variants={{
                    default: { scale: 1 },
                    ...(selectedRole !== tab.role && {
                      hovered: { scale: 1.1 },
                    }),
                    ...(selectedRole !== tab.role && {
                      tapped: {
                        scale: 0.8,
                        transition: {
                          type: "spring",
                          bounce: 0.2,
                          damping: 7,
                          duration: 0.4,
                        },
                      },
                    }),
                  }}
                  transition={{ type: "spring" }}
                  className="relative size-12 sm:size-16"
                >
                  <video
                    key={`initial-${tab.role}`}
                    ref={(el) => {
                      if (el) videoRefs.current[index] = el;
                    }}
                    muted
                    playsInline
                    autoPlay
                    className={cn(
                      "absolute inset-0 mix-blend-screen",
                      tabClicked ? "opacity-0" : "opacity-100",
                    )}
                  >
                    <source src={tab.initialRenderUrl} type="video/webm" />
                  </video>
                  <video
                    key={`clicked-${tab.role}`}
                    ref={(el) => {
                      if (el) videoRefs.current[index] = el;
                    }}
                    muted
                    playsInline
                    autoPlay
                    className={cn(
                      "absolute inset-0 mix-blend-screen",
                      tabClicked ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <source src={tab.videoUrl} type="video/webm" />
                  </video>
                </m.div>
                <span
                  className="text-sm sm:text-base tracking-wide transition-all duration-200"
                  style={{
                    color:
                      selectedRole === tab.role
                        ? "var(--auth-text)"
                        : "var(--auth-text-tertiary)",
                    fontWeight: selectedRole === tab.role ? 500 : 400,
                  }}
                >
                  {tab.label}
                </span>
              </m.button>
            ))}
          </div>
        </m.div>

        <AnimatePresence>
          {selectedRole && (
            <m.form
              key="profile-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onSubmit={
                selectedRole === "influencer"
                  ? handleInfluencerSubmit
                  : handleBusinessContinue
              }
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-2">
                <label
                  htmlFor="ob-name"
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--auth-text-tertiary)" }}
                >
                  Full Name
                </label>
                <input
                  id="ob-name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200"
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 2px 8px var(--auth-shadow)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.5)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.18)")
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="ob-phone"
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--auth-text-tertiary)" }}
                >
                  Phone Number
                </label>
                <PhoneInput
                  id="ob-phone"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={setPhone}
                  required
                  className="w-full h-14 px-4 rounded-2xl text-[15px] transition-all duration-200"
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 2px 8px var(--auth-shadow)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.5)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.18)")
                  }
                />
              </div>

              <AnimatePresence>
                {(selectedRole === "influencer" ||
                  selectedRole === "business") && (
                  <m.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label
                      htmlFor="ob-place"
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--auth-text-tertiary)" }}
                    >
                      City / Place
                    </label>
                    <input
                      id="ob-place"
                      placeholder="e.g. Hyderabad"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      required
                      className="w-full h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200"
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        boxShadow: "0 2px 8px var(--auth-shadow)",
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.5)")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.18)")
                      }
                    />
                  </m.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedRole === "business" && (
                  <m.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "rgba(255,255,255,0.85)" }}
                      >
                        Does your business have an Instagram account?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {(["yes", "no"] as const).map((choice) => {
                          const isActive = businessInstagramChoice === choice;
                          return (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => {
                                setBusinessInstagramChoice(choice);
                                setManualBusinessFlow(choice === "no");
                                if (choice === "no" && !brandLocation.trim()) {
                                  setBrandLocation(place);
                                }
                              }}
                              className="h-14 rounded-2xl border text-[15px] font-medium transition-all duration-200"
                              style={{
                                color: isActive
                                  ? "var(--auth-accent-fg)"
                                  : "var(--auth-text)",
                                background: isActive
                                  ? "var(--auth-gradient)"
                                  : "var(--auth-card)",
                                borderColor: isActive
                                  ? "transparent"
                                  : "var(--auth-card-border)",
                                boxShadow: isActive
                                  ? "0 4px 20px var(--auth-glow)"
                                  : "0 2px 8px var(--auth-shadow)",
                              }}
                            >
                              {choice === "yes" ? "Yes" : "No"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <AnimatePresence>
                      {businessInstagramChoice === "yes" &&
                        !showManualBusinessFields && (
                          <m.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <button
                              type="button"
                              disabled={!canConnectBusinessInstagram || loading}
                              onClick={handleBusinessInstagramConnect}
                              className="w-full h-14 rounded-2xl text-[15px] font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              style={{
                                background:
                                  "linear-gradient(135deg, #FF8FB1 0%, #E8638C 100%)",
                                color: "#fff",
                                boxShadow: "0 4px 20px rgba(232,99,140,0.4)",
                              }}
                            >
                              {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Image
                                  src="/instagram_3d.png"
                                  alt="Instagram"
                                  width={24}
                                  height={24}
                                  style={{ objectFit: "contain" }}
                                />
                              )}
                              Connect with Instagram
                            </button>
                          </m.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {showManualBusinessFields && (
                        <m.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="space-y-4 overflow-hidden"
                        >
                          <div className="space-y-2">
                            <label
                              htmlFor="ob-brand-name"
                              className="text-xs font-medium uppercase tracking-wider"
                              style={{ color: "var(--auth-text-tertiary)" }}
                            >
                              Brand Name
                            </label>
                            <input
                              id="ob-brand-name"
                              placeholder="Your brand or business name"
                              value={brandName}
                              onChange={(e) => setBrandName(e.target.value)}
                              required={showManualBusinessFields}
                              className="w-full h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200"
                              style={{
                                color: "rgba(255,255,255,0.9)",
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.18)",
                                boxShadow: "0 2px 8px var(--auth-shadow)",
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="ob-brand-type"
                              className="text-xs font-medium uppercase tracking-wider"
                              style={{ color: "var(--auth-text-tertiary)" }}
                            >
                              Brand Type
                            </label>
                            <select
                              id="ob-brand-type"
                              value={brandType}
                              onChange={(e) => setBrandType(e.target.value)}
                              className="w-full h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200 appearance-none cursor-pointer"
                              style={{
                                color: brandType
                                  ? "rgba(255,255,255,0.9)"
                                  : "rgba(255,255,255,0.4)",
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.18)",
                                boxShadow: "0 2px 8px var(--auth-shadow)",
                              }}
                            >
                              <option value="">Select type</option>
                              {BUSINESS_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </m.div>
                )}
              </AnimatePresence>

              {(selectedRole === "influencer" || showManualBusinessFields) && (
                <button
                  type="submit"
                  disabled={
                    loading ||
                    (selectedRole === "business" && !brandName.trim())
                  }
                  className="w-full h-14 rounded-2xl text-[15px] font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={
                    selectedRole === "influencer"
                      ? {
                          background:
                            "linear-gradient(135deg, #FF8FB1 0%, #E8638C 100%)",
                          color: "#fff",
                          boxShadow: "0 4px 20px rgba(232,99,140,0.4)",
                        }
                      : {
                          background: "var(--auth-gradient)",
                          color: "var(--auth-accent-fg)",
                          boxShadow: "0 4px 20px var(--auth-glow)",
                        }
                  }
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedRole === "influencer" ? (
                    <Image
                      src="/instagram_3d.png"
                      alt="Instagram"
                      width={24}
                      height={24}
                      style={{ objectFit: "contain" }}
                    />
                  ) : null}
                  {selectedRole === "influencer"
                    ? "Connect with Instagram"
                    : "Complete Brand Profile"}
                </button>
              )}
            </m.form>
          )}
        </AnimatePresence>
      </m.div>
    </AuthShell>
  );
}

export default function Onboarding() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  );
}
