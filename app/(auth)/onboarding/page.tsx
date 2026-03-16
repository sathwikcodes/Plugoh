"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
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
    label: "Brand Owner",
    description: "Find and collaborate with top creators for your brand",
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

export default function Onboarding() {
  const {
    user,
    role,
    profile,
    loading: authLoading,
    refreshUserData,
  } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { setTheme } = useAuthTheme();

  const [selectedRole, setSelectedRole] = useState<AppRole | null>(
    "influencer",
  );
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
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
    if (instagramRedirectInProgress.current) return;
    if (!authLoading && !user) {
      router.replace("/login");
    } else if (!authLoading && role) {
      router.replace(
        role === "influencer" ? "/dashboard/influencer" : "/dashboard/business",
      );
    }
  }, [authLoading, user, role, router]);

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

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedRole) return;
    setLoading(true);

    try {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: selectedRole });
      if (roleError) throw roleError;

      const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] =
        {
          id: user.id,
          email: user.email ?? null,
          full_name: fullName,
          phone: phone || null,
          ...(selectedRole === "business" && {
            business_name: businessName.trim(),
            business_type: businessType || null,
            location: location || null,
          }),
        };

      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" })
        .select()
        .single();
      if (profileError) throw profileError;

      // Verify business_name was actually saved
      if (selectedRole === "business" && !updatedProfile?.business_name) {
        throw new Error(
          "Business name was not saved. Please check that the 'business_name' column exists in the profiles table and run any pending Supabase migrations.",
        );
      }

      if (selectedRole === "influencer") {
        const { error: ipError } = await supabase
          .from("influencer_profiles")
          .insert({
            user_id: user.id,
            display_name: fullName,
            is_active: false,
          });
        if (ipError && ipError.code !== "23505") throw ipError;
      }

      toast({ title: "Profile set up!", description: "Welcome to ReelReach." });

      if (selectedRole === "influencer") {
        const res = await fetch(
          `/api/instagram/connect?userId=${encodeURIComponent(user.id)}`,
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error ?? "Failed to start Instagram OAuth");
        instagramRedirectInProgress.current = true;
        window.location.href = data.url;
      } else {
        await refreshUserData();
        router.replace("/dashboard/business");
      }
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

  return (
    <AuthShell>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={fadeUp} className="lg:hidden mb-2 text-center">
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--auth-text)" }}
          >
            ReelReach
          </h2>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-2 text-center">
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "var(--auth-text)" }}
          >
            Welcome to ReelReach
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--auth-text-secondary)" }}
          >
            Tell us who you are to get started.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <div className="flex justify-center gap-6 sm:gap-10">
            {ROLE_TABS.map((tab, index) => (
              <motion.button
                key={tab.role}
                type="button"
                whileTap="tapped"
                whileHover="hovered"
                onClick={() => handleRoleSelect(tab.role, index)}
                className="relative flex items-center gap-2 cursor-pointer outline-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <motion.div
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
                      "absolute inset-0",
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
                      "absolute inset-0",
                      tabClicked ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <source src={tab.videoUrl} type="video/webm" />
                  </video>
                </motion.div>
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
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedRole && (
              <motion.p
                key={selectedRole}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-[13px] leading-relaxed text-center"
                style={{ color: "var(--auth-text-secondary)" }}
              >
                {ROLE_TABS.find((t) => t.role === selectedRole)?.description}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {selectedRole && (
            <motion.form
              key="profile-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onSubmit={handleSubmit}
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
                    color: "var(--auth-text)",
                    background: "var(--auth-card)",
                    border: "1px solid var(--auth-card-border)",
                    boxShadow: "0 2px 8px var(--auth-shadow)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--auth-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--auth-card-border)")
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
                    color: "var(--auth-text)",
                    background: "var(--auth-card)",
                    border: "1px solid var(--auth-card-border)",
                    boxShadow: "0 2px 8px var(--auth-shadow)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--auth-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--auth-card-border)")
                  }
                />
              </div>

              <AnimatePresence>
                {selectedRole === "business" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="ob-business-name"
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--auth-text-tertiary)" }}
                      >
                        Business Name
                      </label>
                      <input
                        id="ob-business-name"
                        placeholder="Your brand or business name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        className="w-full h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200"
                        style={{
                          color: "var(--auth-text)",
                          background: "var(--auth-card)",
                          border: "1px solid var(--auth-card-border)",
                          boxShadow: "0 2px 8px var(--auth-shadow)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--auth-accent)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--auth-card-border)")
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="ob-business-type"
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--auth-text-tertiary)" }}
                      >
                        Business Type
                      </label>
                      <select
                        id="ob-business-type"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200 appearance-none cursor-pointer"
                        style={{
                          color: businessType
                            ? "var(--auth-text)"
                            : "var(--auth-text-tertiary)",
                          background: "var(--auth-card)",
                          border: "1px solid var(--auth-card-border)",
                          boxShadow: "0 2px 8px var(--auth-shadow)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--auth-accent)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--auth-card-border)")
                        }
                      >
                        <option value="">Select type (optional)</option>
                        {BUSINESS_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="ob-location"
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--auth-text-tertiary)" }}
                      >
                        City / Location
                      </label>
                      <input
                        id="ob-location"
                        placeholder="e.g. Hyderabad"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-14 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200"
                        style={{
                          color: "var(--auth-text)",
                          background: "var(--auth-card)",
                          border: "1px solid var(--auth-card-border)",
                          boxShadow: "0 2px 8px var(--auth-shadow)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--auth-accent)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--auth-card-border)")
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={
                  loading ||
                  (selectedRole === "business" && !businessName.trim())
                }
                className="w-full h-14 rounded-2xl text-[15px] font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: "var(--auth-gradient)",
                  color: "var(--auth-accent-fg)",
                  boxShadow: "0 4px 20px var(--auth-glow)",
                }}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : selectedRole === "influencer" ? (
                  <Instagram className="h-5 w-5" />
                ) : null}
                {selectedRole === "influencer"
                  ? "Connect with Instagram"
                  : "Get Started"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthShell>
  );
}
