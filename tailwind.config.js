/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F3D68",
          dark: "#0A2C4E",
          light: "#154C82",
        },
        accent: {
          DEFAULT: "#0EA5E9",
          dark: "#0284C7",
          light: "#38BDF8",
        },
        surface: "#F1F5F9",
        ok: { DEFAULT: "#16A34A", bg: "#DCFCE7", text: "#166534" },
        bad: { DEFAULT: "#DC2626", bg: "#FEE2E2", text: "#991B1B" },
        warn: { DEFAULT: "#EA580C", bg: "#FFEDD5", text: "#9A3412" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 61 104 / 0.08), 0 1px 2px -1px rgb(15 61 104 / 0.08)",
        lifted: "0 8px 24px -8px rgb(15 61 104 / 0.25)",
        glow: "0 0 0 4px rgb(14 165 233 / 0.15)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #154C82 0%, #0A2C4E 100%)",
        "mesh-light": "radial-gradient(at 20% 0%, rgba(14,165,233,0.10) 0px, transparent 50%), radial-gradient(at 80% 100%, rgba(15,61,104,0.08) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
}
