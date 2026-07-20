"use client";

import { useEffect } from "react";

/**
 * Keeps the --visual-viewport-* custom properties (consumed by .modal-backdrop
 * in globals.css) in sync with the real visual viewport, so modals size and
 * position themselves against what's actually visible on iOS rather than the
 * static layout viewport.
 *
 * --keyboard-inset is the space the on-screen keyboard occupies. The backdrop
 * stays full-screen so its dim/blur covers everything, and spends this value
 * as bottom padding instead — that keeps the card centred in the visible area
 * without shrinking the overlay itself and exposing the page above the
 * keyboard.
 */
export function useVisualViewportVars() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const root = document.documentElement;

    const update = () => {
      root.style.setProperty("--visual-viewport-height", `${vv.height}px`);
      root.style.setProperty("--visual-viewport-offsetTop", `${vv.offsetTop}px`);

      // iOS leaves the layout viewport (window.innerHeight) alone when the
      // keyboard opens and only shrinks the visual viewport, so the gap
      // between them is the keyboard. Clamped at 0 for rubber-band scroll,
      // where the subtraction can briefly go negative.
      const keyboard = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop
      );
      root.style.setProperty("--keyboard-inset", `${keyboard}px`);
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
