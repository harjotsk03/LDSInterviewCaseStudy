import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm off-white background — never pure white.
        canvas: {
          DEFAULT: "#FAF8F5",
          deep: "#F2EEE7",
          card: "#FFFFFB",
        },
        // Charcoal/slate text — never pure black.
        ink: {
          DEFAULT: "#1F2937",
          soft: "#4B5563",
          mute: "#6B7280",
          faint: "#9CA3AF",
        },
        // "Your words preserved" — soft sage.
        sage: {
          50: "#F1F5F0",
          100: "#E2EBDE",
          200: "#C5D8BD",
          300: "#A4C19A",
          500: "#6E9A66",
          700: "#4F7548",
        },
        // AI-touched cues — gentle pale blue, never "correction red".
        mist: {
          50: "#F0F4F8",
          100: "#E0EAF1",
          200: "#C5D7E3",
          300: "#9DBACD",
          500: "#5E89A8",
          700: "#3D6886",
        },
        // Warm beige accent.
        sand: {
          50: "#FAF5EC",
          100: "#F2E9D5",
          200: "#E5D4AC",
          300: "#D4BB7E",
        },
      },
      fontFamily: {
        sans: [
          "Atkinson Hyperlegible",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontSize: {
        // Student-facing minimums.
        student: ["18px", { lineHeight: "1.6", letterSpacing: "0.02em" }],
        "student-lg": ["22px", { lineHeight: "1.55", letterSpacing: "0.015em" }],
        "student-xl": ["28px", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        "student-2xl": ["34px", { lineHeight: "1.45", letterSpacing: "0.005em" }],
      },
      letterSpacing: {
        comfy: "0.02em",
        roomy: "0.03em",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem",
      },
      boxShadow: {
        // Softer, more ambient shadows. The first level is for resting
        // cards; the second is for hover / floating elements; the third
        // is the "hero" treatment used on the polished-answer card.
        soft: "0 1px 1px rgba(31,41,55,0.03), 0 10px 28px -10px rgba(31,41,55,0.06)",
        lift: "0 2px 4px rgba(31,41,55,0.04), 0 22px 50px -16px rgba(31,41,55,0.10)",
        hero: "0 1px 1px rgba(31,41,55,0.03), 0 30px 60px -22px rgba(110,154,102,0.18)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out both",
        "fade-up": "fade-up 320ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
