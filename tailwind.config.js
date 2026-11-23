/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './wall-editor.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // These reference the CSS variables set in src/index.css
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      colors: {
        'bg-main': 'var(--color-bg-main)',
        'text-main': 'var(--color-text-main)',
        'text-muted': 'var(--color-text-muted)',
      },
      transitionTimingFunction: {
        'expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'view-enter': 'viewEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'view-exit': 'viewExit 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slow-spin': 'slowSpin 45s linear infinite',
        'reveal': 'reveal 1.0s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        viewEnter: {
          '0%': { opacity: '0', filter: 'blur(3px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        viewExit: {
          '0%': { opacity: '1', filter: 'blur(0)' },
          '100%': { opacity: '0', filter: 'blur(3px)' },
        },
        reveal: {
          '0%': { transform: 'scale(1.05)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slowSpin: {
          '0%': { transform: 'scale(3) rotate(0deg)' },
          '100%': { transform: 'scale(3) rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
