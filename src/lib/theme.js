// HH Goa 2026 (Hacker House Goa) — matched to the real event site's brand:
// deep tropical green, sunflower yellow, hot pink accent, thick black poster
// outlines, Imbue (serif display) + Victor Mono (monospace, hacker vibe).
export const THEME = {
  green: "#0B6839",
  greenDark: "#083F23",
  yellow: "#FEE101",
  pink: "#FF0080",
  cream: "#FFFBE8",
  black: "#000000",
  white: "#FFFFFF",
};

export const FONT_DISPLAY = "Imbue, Georgia, 'Times New Roman', serif";
export const FONT_MONO = "'Victor Mono', 'Courier New', monospace";

/** The exact font strings used by document.fonts.load() before drawing,
 *  so canvas text doesn't render with a fallback font on first paint. */
export const FONT_LOAD_SPECS = [
  "700 40px Imbue",
  "900 40px Imbue",
  "500 40px 'Victor Mono'",
  "600 40px 'Victor Mono'",
  "700 40px 'Victor Mono'",
  "italic 500 40px 'Victor Mono'",
];

export function paintSunsetGradient(ctx, x0, y0, x1, y1) {
  // Kept for backwards compatibility with earlier calls; now just a solid
  // brand green fill (no gradient — matches the site's flat poster look).
  return THEME.green;
}

export const BUILDER_TITLES = [
  "Chief Vibes Compiler",
  "Full-Stack Beach Coder",
  "Senior Bug Wrangler",
  "Head of Ship-It",
  "Latency Assassin",
  "Prompt Whisperer",
  "Merge Conflict Survivor",
  "Sunset-Driven Developer",
  "Caffeine-to-Code Converter",
  "Resident 2am Deployer",
  "API Sommelier",
  "Chaos Engineer, Off-Duty",
  "Goa Grade Hustler",
  "Founder of Something (TBD)",
  "Async Legend",
  "Stack Overflow Diplomat",
  "Demo Day Gambler",
  "Recursion Enthusiast",
  "Uptime Optimist",
  "Beachside Backend Wizard",
];

export function pickBuilderTitle(seedString = "") {
  // Deterministic on purpose: this runs during server render AND during
  // client hydration before any user input, so it must return the same
  // value both times (no Date.now()/Math.random() here) or React throws a
  // hydration mismatch. The 🎲 button in the UI still gives true randomness
  // client-side, after the page has mounted.
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) seed = (seed * 31 + seedString.charCodeAt(i)) >>> 0;
  const idx = seed % BUILDER_TITLES.length;
  return BUILDER_TITLES[idx];
}
