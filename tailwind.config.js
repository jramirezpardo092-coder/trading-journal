/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        surface: '#161b22',
        'surface-2': '#1c2330',
        border: '#30363d',
        accent: '#22c55e',
        'accent-dim': '#16a34a',
        danger: '#ef4444',
        'text-dim': '#8b949e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
