"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type?: AlertType;
  message?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
}

const typeStyles: Record<AlertType, string> = {
  success: "border-green-300 bg-green-100 text-green-800",
  error: "border-red-300 bg-red-100 text-red-800",
  warning: "border-yellow-300 bg-yellow-100 text-yellow-800",
  info: "border-blue-300 bg-blue-100 text-blue-800",
};

const fadeInBlur = {
  initial: { opacity: 0, filter: "blur(10px)", y: 10, rotate: 0 },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    rotate: 0,
    transition: { duration: 0.2, ease: "easeInOut" as const },
  },
};

export function getAlertClassName(
  type: AlertType,
  className?: string,
  opts?: { align?: "center" | "start" },
) {
  const align = opts?.align ?? "center";
  return cn(
    "flex gap-x-2 border text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl",
    align === "start" ? "items-start" : "items-center",
    typeStyles[type],
    className,
  );
}

const Alert: React.FC<AlertProps> = ({
  type = "info",
  message = "This is an alert message.",
  onClick,
  className,
}) => {
  return (
    <motion.div
      className={getAlertClassName(type, className)}
      role="alert"
      variants={fadeInBlur}
      initial="initial"
      animate="animate"
      whileHover={{
        scale: 1.01,
        rotate: 1,
        transition: {
          duration: 0.2,
          ease: "easeInOut" as const,
        },
      }}
      whileTap={{
        scale: 0.99,
        transition: {
          duration: 0.2,
          ease: "easeInOut" as const,
        },
      }}
      onClick={onClick}
    >
      <span className="font-bold capitalize">{type}:</span>
      <span>{message}</span>
    </motion.div>
  );
};

export default Alert;
