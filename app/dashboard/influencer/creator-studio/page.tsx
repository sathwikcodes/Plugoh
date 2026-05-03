import type { Metadata } from "next";
import { AICreatorStudioComingSoon } from "./ai-creator-studio-coming-soon";

export const metadata: Metadata = {
  title: "AI Creator Studio",
  description:
    "Voice clone, face avatar, multilingual studio, and Auto-SGI—in roadmap inside Plugoh.",
};

export default function CreatorStudioPage() {
  return <AICreatorStudioComingSoon />;
}
