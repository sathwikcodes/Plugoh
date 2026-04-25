import { useSyncExternalStore } from "react";

/**
 * Returns Date.now(), updated on the given interval. SSR-safe: returns 0
 * during server render and on the client's first paint, then resyncs on mount
 * — avoids the hydration mismatch you get from `useState(() => Date.now())`.
 *
 * Pass `intervalMs = 0` (or omit) for a one-shot mount-time read.
 */
export function useCurrentTime(intervalMs: number = 0): number {
  return useSyncExternalStore(
    (callback) => {
      callback();
      if (intervalMs <= 0) return () => {};
      const id = setInterval(callback, intervalMs);
      return () => clearInterval(id);
    },
    () => Date.now(),
    () => 0,
  );
}
