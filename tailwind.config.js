/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:          '#080c12',
        surface:     '#0f1621',
        'surface-2': '#161d2b',
        'surface-3': '#1c2535',
        border:      '#252e3e',
        'border-2':  '#2d3748',
        accent:      '#22c55e',
        'accent-dim':'#16a34a',
        'accent-glow':'rgba(34,197,94,0.15)',
        danger:      '#ef4444',
        'danger-dim':'#dc2626',
        warning:     '#f59e0b',
        blue:        '#3b82f6',
        'text-bright':'#f0f6fc',
        'text-dim':  '#8b949e',
        'text-muted':'#4d5566',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(34,197,94,0.15)',
        'glow':     '0 0 24px rgba(34,197,94,0.20)',
        'card':     '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.1)',
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
        'gradient-accent': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0f1621 0%, #080c12 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
