module.exports = {
  darkMode: "class",
  content: ["./App.js", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["PlusJakartaSans_400Regular"],
        medium: ["PlusJakartaSans_500Medium"],
        semibold: ["PlusJakartaSans_600SemiBold"],
        bold: ["PlusJakartaSans_700Bold"],
        extrabold: ["PlusJakartaSans_800ExtraBold"],
      },
      colors: {
        // Navy profesional — color primario de la marca (botones, links, precios).
        brand: {
          50: "#EEF4F9",
          100: "#D6E6F0",
          200: "#AECDDF",
          300: "#7FADC9",
          400: "#4C87AC",
          500: "#2E6B90",
          600: "#1E5474",
          700: "#164060",
          800: "#102E47",
          900: "#0A1F30",
        },
        // Coral cálido — momentos de highlight puntuales: favoritos, badges de no leído.
        accent: {
          400: "#FFA07A",
          500: "#F2703C",
          600: "#D85A2A",
        },
      },
    },
  },
  plugins: [],
};
