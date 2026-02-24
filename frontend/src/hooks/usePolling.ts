import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  intervalMs: number;
  enabled?: boolean;
}

/**
 * Runs `fn` on mount and then every `intervalMs` milliseconds.
 * Pauses when the tab is hidden (Page Visibility API).
 * Immediately fires when the tab becomes visible again.
 */
export const usePolling = (fn: () => Promise<void> | void, options: UsePollingOptions) => {
  const { intervalMs, enabled = true } = options;
  const savedFn = useRef(fn);
  savedFn.current = fn;

  const poll = useCallback(() => savedFn.current(), []);

  useEffect(() => {
    if (!enabled) return;

    poll();
    let timer = setInterval(poll, intervalMs);

    const handleVisibility = () => {
      clearInterval(timer);
      if (document.visibilityState === "visible") {
        poll();
        timer = setInterval(poll, intervalMs);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [poll, intervalMs, enabled]);
};
