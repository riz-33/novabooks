/** @type {import('tailwindcss').Config} */
const config = {
  // Update this section to match Next.js structure
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your custom NovaBooks branding
        novaNavy: "#1e3a8a",
        novaGold: "#d4af37",
        novaGoldDark: "#b08d2b",
        novaGray: "#9ca3af",
      },
      // Tip: Since you're using 2rem borders in your Dashboard, 
      // you can add a custom border radius here too
    },
  },
  plugins: [],
};

export default config;