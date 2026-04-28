"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
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
import PhoneInput from "@/components/ui/phone-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BUSINESS_TYPES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_TABS = [
  {
    role: "influencer" as AppRole,
    label: "Influencer",
    description: "Showcase your content and land brand deals",
    iconSrc: "/instagram_3d.png",
  },
  {
    role: "business" as AppRole,
    label: "Brand",
    description: "Find and collaborate with top influencers for your brand",
    iconSrc: "/megaphone.png",
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
  const [businessStep, setBusinessStep] = useState<"identity" | "details">(
    "identity",
  );
  const [loading, setLoading] = useState(false);
  const instagramRedirectInProgress = useRef(false);

  const handlePhoneChange = useCallback((nextPhone: string) => {
    setPhone((prev) => (prev === nextPhone ? prev : nextPhone));
  }, []);

  const handlePlaceChange = useCallback((nextPlace: string) => {
    setPlace((prev) => (prev === nextPlace ? prev : nextPlace));
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

  const handleRoleSelect = useCallback(
    (r: AppRole) => {
      setSelectedRole(r);
      setTheme(r === "influencer" ? "influencer" : "brand");
      setBusinessInstagramChoice(null);
      setManualBusinessFlow(false);
      setBusinessStep("identity");
    },
    [setTheme],
  );

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

  const showBusinessIdentityStep =
    selectedRole === "business" && businessStep === "identity";
  const showManualBusinessFields =
    selectedRole === "business" && businessStep === "details";
  const canMoveToBusinessDetails =
    !!fullName.trim() && !!phone.trim() && !!place.trim();
  const canConnectBusinessInstagram =
    selectedRole === "business" &&
    businessStep === "identity" &&
    businessInstagramChoice === "yes" &&
    !!fullName.trim() &&
    !!phone.trim() &&
    !!place.trim();

  return (
    <AuthShell>
      <m.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-5 sm:space-y-8"
      >
        <m.div variants={fadeUp} className="text-center">
          <p
            className="text-lg font-semibold"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            Tell us who you are to get started.
          </p>
        </m.div>

        <m.div variants={fadeUp} className="space-y-3 sm:space-y-4">
          <Tabs
            value={selectedRole ?? ROLE_TABS[0].role}
            onValueChange={(value) => handleRoleSelect(value as AppRole)}
            className="w-full"
          >
            <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl border border-white/8 bg-white/6 p-0.75">
              {ROLE_TABS.map((tab, index) => (
                <TabsTrigger
                  key={tab.role}
                  value={tab.role}
                  className="group flex items-center justify-center gap-2 rounded-[0.65rem] border border-transparent px-3 py-1.5 text-sm text-white/60 hover:text-white/80 data-[state=active]:border-amber-400/35 data-[state=active]:bg-[linear-gradient(135deg,rgba(245,158,11,0.32)_0%,rgba(232,99,140,0.28)_100%)] data-[state=active]:text-white data-[state=active]:shadow-none"
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
                    className="relative size-8 sm:size-10"
                  >
                    <Image
                      src={tab.iconSrc}
                      alt={tab.label}
                      fill
                      className="object-contain p-0.5"
                      sizes="40px"
                    />
                  </m.div>
                  <span className="tracking-wide font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
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
              className="space-y-3 sm:space-y-4 overflow-hidden"
            >
              {!(selectedRole === "business" && businessStep === "details") && (
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
                    className="w-full h-12 sm:h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200"
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
              )}

              {!(selectedRole === "business" && businessStep === "details") && (
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
                    onChange={handlePhoneChange}
                    required
                    className="w-full h-12 sm:h-14 px-4 rounded-2xl text-[15px] transition-all duration-200"
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
              )}

              <AnimatePresence>
                {(selectedRole === "influencer" ||
                  showBusinessIdentityStep) && (
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
                      onChange={(e) => handlePlaceChange(e.target.value)}
                      required
                      className="w-full h-12 sm:h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200"
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
                                if (
                                  choice === "no" &&
                                  !canMoveToBusinessDetails
                                ) {
                                  toast({
                                    title: "Complete your basic details first",
                                    description:
                                      "Please enter full name, phone number, and city/place before continuing.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                setBusinessInstagramChoice(choice);
                                setManualBusinessFlow(choice === "no");
                                if (choice === "no" && !brandLocation.trim()) {
                                  setBrandLocation(place);
                                }
                                setBusinessStep(
                                  choice === "no" ? "details" : "identity",
                                );
                              }}
                              className="h-12 sm:h-14 rounded-2xl border text-[15px] font-medium transition-all duration-200"
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
                              className="w-full h-12 sm:h-14 rounded-2xl text-[15px] font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                          className="space-y-3 sm:space-y-4 overflow-hidden"
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
                              className="w-full h-12 sm:h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200"
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
                              className="w-full h-12 sm:h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200 appearance-none cursor-pointer"
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
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      (selectedRole === "business" && !brandName.trim())
                    }
                    className="w-full h-12 sm:h-14 rounded-2xl text-[15px] font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      : "Continue"}
                  </button>
                  {showManualBusinessFields && (
                    <button
                      type="button"
                      onClick={() => setBusinessStep("identity")}
                      className="w-full h-12 rounded-2xl text-[14px] font-medium transition-all duration-200 flex items-center justify-center"
                      style={{
                        color: "rgba(255,255,255,0.78)",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    >
                      Back
                    </button>
                  )}
                </div>
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
