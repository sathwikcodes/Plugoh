"use client";

import { SharedEmptyState } from "@/components/inbox/shared-empty-state";

export function InboxEmptyState() {
  return (
    <SharedEmptyState hint="Select a creator conversation to start managing campaign messages." />
  );
}
