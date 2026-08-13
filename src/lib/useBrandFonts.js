"use client";
import { useEffect, useState } from "react";
import { FONT_LOAD_SPECS } from "./theme";

/**
 * Waits for the self-hosted Imbue + Victor Mono font files to actually be
 * loaded before the canvas draws — otherwise the very first render (and
 * anything exported/downloaded quickly after page load) would silently
 * fall back to a system serif/monospace instead of the real brand fonts.
 */
export function useBrandFonts() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (typeof document === "undefined" || !document.fonts) {
      setReady(true);
      return;
    }
    Promise.all(FONT_LOAD_SPECS.map((spec) => document.fonts.load(spec).catch(() => null)))
      .then(() => document.fonts.ready)
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
