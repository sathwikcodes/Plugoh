"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompleteProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/influencer/profile");
  }, [router]);
  return null;
}
