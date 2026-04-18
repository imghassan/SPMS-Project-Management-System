/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0d1117",
          secondary: "#161b22",
          card: "#1c2128",
          hover: "#21262d",
        },
        accent: {
          teal: "#00d4c8",
          "teal-muted": "#0ea5a0",
        },
        text: {
          primary: "#e6edf3",
          secondary: "#8b949e",
          muted: "#484f58",
        },
        border: "#30363d",
        priority: {
          high: "#f85149",
          medium: "#d29922",
          low: "#3fb950",
        },
        status: {
          progress: "#d29922",
          review: "#58a6ff",
          done: "#3fb950",
          todo: "#8b949e",
        },
        overdue: "#f85149",
        tag: {
          backend: "#1d4ed8",
          api: "#1e3a5f",
          marketing: "#7c3aed",
          design: "#065f46",
          mobile: "#0e7490",
        },
      },
      fontFamily: {
        sans: ["Inter", "Geist", "sans-serif"],
        mono: ["DM Mono", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "12px",
      },
    },
  },
  plugins: [],
}
