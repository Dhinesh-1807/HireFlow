/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          50: '#F0F9FF',   // Very Light Sky
          100: '#E0F2FE',  // Light Sky
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',  // Secondary Blue
          500: '#0EA5E9',  // Primary Sky Blue
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 8px 20px rgba(14, 165, 233, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
}
