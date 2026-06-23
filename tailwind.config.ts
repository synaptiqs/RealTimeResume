import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          500: "#2f6df6",
          600: "#1f57d6",
          700: "#1b46a8",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
