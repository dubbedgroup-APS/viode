/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        mist: "#d9e7ff",
        accent: "#5eead4",
        coral: "#fb7185",
        sun: "#fbbf24",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(13, 148, 136, 0.18)",
      },
      backgroundImage: {
        "hero-orbs":
          "radial-gradient(circle at top left, rgba(94, 234, 212, 0.22), transparent 30%), radial-gradient(circle at top right, rgba(251, 191, 36, 0.16), transparent 28%), radial-gradient(circle at bottom center, rgba(59, 130, 246, 0.18), transparent 30%)",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};

