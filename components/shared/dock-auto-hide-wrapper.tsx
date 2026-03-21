"use client";

import { Suspense } from "react";
import { motion } from "motion/react";
import { useDockAutoHide } from "@/hooks/use-dock-auto-hide";

function DockAutoHideInner({ children }: { children: React.ReactNode }) {
  const {
    shouldHideDock,
    showTriggerZone,
    onTriggerEnter,
    onDockEnter,
    onDockLeave,
  } = useDockAutoHide();

  return (
    <>
      {/* Invisible trigger zone at bottom edge — desktop auto-hide only */}
      {showTriggerZone && (
        <div
          className="fixed bottom-0 left-0 right-0 h-3 z-50 pointer-events-auto"
          onMouseEnter={onTriggerEnter}
        />
      )}

      {/* Animated dock container */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 md:px-0"
        style={{
          paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
        }}
        animate={{ y: shouldHideDock ? "100%" : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onMouseEnter={onDockEnter}
        onMouseLeave={onDockLeave}
      >
        {children}
      </motion.div>
    </>
  );
}

// Fallback: render dock normally (visible, no auto-hide) while Suspense resolves
function DockFallback({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 md:px-0"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}
    >
      {children}
    </div>
  );
}

export function DockAutoHideWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DockFallback>{children}</DockFallback>}>
      <DockAutoHideInner>{children}</DockAutoHideInner>
    </Suspense>
  );
}
