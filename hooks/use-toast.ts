"use client";

import { toast as sonnerToast } from "sonner";

type ToastVariant =
  | "default"
  | "destructive"
  | "success"
  | "error"
  | "warning"
  | "info";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

function toast({ title, description, variant }: ToastOptions) {
  const message = title || "";

  switch (variant) {
    case "destructive":
    case "error":
      sonnerToast.error(message, { description });
      break;
    case "warning":
      sonnerToast.warning(message, { description });
      break;
    case "info":
      sonnerToast.info(message, { description });
      break;
    case "success":
    case "default":
    default:
      sonnerToast.success(message, { description });
  }
}

export function useToast() {
  return { toast };
}

export { toast };
