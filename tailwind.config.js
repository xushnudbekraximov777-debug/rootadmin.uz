/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', "ui-monospace", "monospace"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        base: {
          950: "#0a0d12",
          900: "#0d1117",
          850: "#11161f",
          800: "#161c27",
          700: "#1e2633",
          600: "#2a3342",
          500: "#3a4456",
        },
        neon: {
          cyan: "#22d3ee",
          green: "#22ff88",
          amber: "#fbbf24",
          purple: "#a855f7",
        },
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(34,211,238,0.25), 0 0 24px rgba(34,211,238,0.18)",
        "neon-green": "0 0 0 1px rgba(34,255,136,0.25), 0 0 24px rgba(34,255,136,0.18)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        blink: "blink 1s step-end infinite",
        scan: "scan 6s linear infinite",
      },
      keyframes: {
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
