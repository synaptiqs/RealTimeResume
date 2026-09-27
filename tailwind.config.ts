import type { Config } from "tailwindcss";

// Colors are driven by CSS variables (see globals.css) so light/dark is a single
// class toggle on <html>. Tokens map 1:1 to the PRD §7 design tokens.
const token = (name: string) => `var(--${name})`;

export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        text: token("text"),
        "text-2": token("text-2"),
        muted: token("muted"),
        subtle: token("subtle"),
        disabled: token("disabled"),
        border: token("border"),
        accent: token("accent"),
        "accent-bg": token("accent-bg"),
        upgrade: token("upgrade"),
        danger: token("danger"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "12px",
        frame: "32px",
      },
      boxShadow: {
        frame: "var(--shadow-frame)",
      },
      maxWidth: {
        app: "30rem", // ~480px mobile-first column
      },
    },
  },
  plugins: [],
} satisfies Config;
