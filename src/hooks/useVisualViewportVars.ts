"use client";

import { useEffect } from "react";

/**
 * Keeps --visual-viewport-height and --visual-viewport-offsetTop (consumed by
 * .modal-backdrop in globals.css) in sync with the real visual viewport, so
 * modals size/position themselves against what's actually visible on iOS
 * rather than the static layout viewport.
 */
export function useVisualViewportVars() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const root = document.documentElement;

    const update = () => {
      root.style.setProperty("--visual-viewport-height", `${vv.height}px`);
      root.style.setProperty("--visual-viewport-offsetTop", `${vv.offsetTop}px`);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);
}
