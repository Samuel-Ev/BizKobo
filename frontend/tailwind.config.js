/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#FAFBF9",
        "ink-2": "#FFFFFF",
        "ink-3": "#F0F4F0",
        paper: "#16281D",
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
          DEFAULT: "#66746B",
          dark: "#425046",
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
