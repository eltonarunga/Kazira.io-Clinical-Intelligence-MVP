/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./main.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./constants.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: '#1a1a18',
        ink2: '#3d3d38',
        ink3: '#6b6b65',
        surface: '#faf9f6',
        surface2: '#f2f0ea',
        surface3: '#e8e4da',
        accent: '#1d6b4a',
        accent2: '#2d9b6a',
        'accent-light': '#e6f5ee',
        'accent-pale': '#f0faf5',
        warn: '#b85c1a',
        'warn-light': '#fef3ea',
        gold: '#c49a2a',
        'gold-light': '#fdf6e3',
        border: '#e5e5e5',
        border2: '#d4d4d4',
      }
    },
  },
  plugins: [],
}
