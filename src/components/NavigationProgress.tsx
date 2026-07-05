"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

/**
 * A slim progress bar that animates along the top edge of the bottom nav
 * whenever a client-side navigation is in progress.
 *
 * Detection strategy:
 * - Listen for clicks on internal <a> links that will trigger Next.js navigation.
 * - When a click is detected on a link whose href differs from the current pathname,
 *   start the progress animation.
 * - When `usePathname()` changes, the navigation has completed — finish the bar
 *   and fade it out.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousPathRef = useRef(pathname);

  // Clean up any running interval
  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start the progress bar (called on link click)
  const start = useCallback(() => {
    clearTick();
    setProgress(0);
    setVisible(true);
    setIsNavigating(true);

    // Animate progress incrementally, slowing as it approaches 90%
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.max(1, (90 - current) * 0.08);
      if (current >= 90) current = 90;
      setProgress(current);
    }, 50);
  }, [clearTick]);

  // Finish the bar (called when pathname changes)
  const finish = useCallback(() => {
    clearTick();
    setProgress(100);
    setIsNavigating(false);

    // Let the bar sit at 100% briefly, then fade out
    const timer = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [clearTick]);

  // Detect navigation start via click interception
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only intercept internal links (not external, not anchors, not same page)
      if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;
      if (href === pathname) return;

      start();
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname, start]);

  // Detect navigation completion via pathname change
  useEffect(() => {
    if (pathname !== previousPathRef.current) {
      previousPathRef.current = pathname;
      if (isNavigating) {
        Promise.resolve().then(() => {
          finish();
        });
      }
    }
  }, [pathname, isNavigating, finish]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTick();
  }, [clearTick]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none"
      style={{ height: "3px" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #c8ff00, #a0e600)",
          boxShadow: "0 0 10px rgba(200, 255, 0, 0.5), 0 0 5px rgba(200, 255, 0, 0.3)",
          transition: isNavigating
            ? "width 50ms linear"
            : "width 200ms ease-out, opacity 300ms ease-out",
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
