/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        ink: {
          900: 'var(--color-ink-900)',
          700: 'var(--color-ink-700)',
          500: 'var(--color-ink-500)',
          400: 'var(--color-ink-400)',
          300: 'var(--color-ink-300)',
        },
        // Sidebar — uses adaptive vars in dark mode
        sidebar: {
          from: 'var(--color-sidebar-from)',
          via: 'var(--color-sidebar-via)',
          to: 'var(--color-sidebar-to)',
          border: 'var(--color-sidebar-border)',
          text: 'var(--color-sidebar-text)',
          textActive: 'var(--color-sidebar-text-active)',
        },
        // Primary brand blue — Coursera blue (#0056D2), per mentor direction
        accent: {
          50: '#E8F0FC',
          100: '#D2E3FA',
          300: '#7FA9EF',
          500: '#0056D2',
          600: '#0048B0',
          700: '#003A8C',
        },
        // Secondary brand purple
        purple: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          300: '#C4B5FD',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },
        success: { 50: '#F0FDF4', 100: '#DCFCE7', 500: '#16A34A', 600: '#15803D', 700: '#166534' },
        warning: { 50: '#FFFBEB', 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
        danger: { 50: '#FEF2F2', 100: '#FEE2E2', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
        info: { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0' }],
        base: ['0.9375rem', { lineHeight: '1.5rem', letterSpacing: '-0.006em' }],
        lg: ['1.0625rem', { lineHeight: '1.6rem', letterSpacing: '-0.011em' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.014em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.017em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '10px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(18, 20, 43, 0.05)',
        sm: '0 1px 3px rgba(18, 20, 43, 0.06), 0 1px 2px rgba(18, 20, 43, 0.04)',
        card: '0 2px 10px rgba(18, 20, 43, 0.05), 0 1px 2px rgba(18, 20, 43, 0.04)',
        'card-hover': '0 10px 28px rgba(18, 20, 43, 0.10)',
        popover: '0 12px 32px rgba(18, 20, 43, 0.14), 0 2px 6px rgba(18, 20, 43, 0.06)',
        'sidebar-active': '0 4px 14px rgba(67, 97, 238, 0.35)',
      },
      spacing: {
        4.5: '1.125rem',
        18: '4.5rem',
        68: '17rem',
      },
      backgroundImage: {
        'sidebar-gradient': 'radial-gradient(circle at 20% 0%, var(--color-sidebar-to) 0%, var(--color-sidebar-via) 45%, var(--color-sidebar-from) 100%)',
        'banner-gradient': 'linear-gradient(115deg, #0056D2 0%, #2E7BE0 55%, #4E97EE 100%)',
        'hero-text': 'linear-gradient(to right, #C3AEFA, #8B5CF6, #3B82F6)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'toast-in': { from: { opacity: 0, transform: 'translateY(-8px) scale(0.98)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
        // Phase 1 motion system additions (see Part G.1 of the redesign brief) —
        // staggered list/grid entrance and the reserved-for-Phase-3 unlock pulse.
        'entrance-rise': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'badge-unlock': {
          '0%': { transform: 'scale(0)', boxShadow: '0 0 0 0 rgba(139,92,246,0)' },
          '60%': { transform: 'scale(1.08)', boxShadow: '0 0 0 10px rgba(139,92,246,0.15)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(139,92,246,0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'toast-in': 'toast-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        'entrance-rise': 'entrance-rise 0.3s ease-out both',
        'badge-unlock': 'badge-unlock 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
    },
  },
  plugins: [],
};
