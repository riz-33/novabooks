/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // This covers everything inside src (app, components, lib, etc.)
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // For projects not using /src
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "nova-navy": "#1e3a8a",
        "nova-gold": "#d4af37",
        "nova-gold-dark": "#b08d2b",
        "nova-gray": "#9ca3af",
      },
    },
  },
  plugins: [],
};

export default config;
