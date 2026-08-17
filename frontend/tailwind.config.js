/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-2": "rgb(var(--color-ink-2) / <alpha-value>)",
        "ink-3": "rgb(var(--color-ink-3) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        copper: {
          DEFAULT: "#D9A230",
          light: "#EFB63F",
          dark: "#8A6118",
        },
        green: {
          DEFAULT: "#214E35",
          light: "#2F8F5B",
          dark: "#123018",
        },
        amber: "#E8A33D",
        slate: {
          DEFAULT: "rgb(var(--color-slate) / <alpha-value>)",
          dark: "rgb(var(--color-slate-dark) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        xl2: "20px",
      },
    },
  },
  plugins: [],
};
