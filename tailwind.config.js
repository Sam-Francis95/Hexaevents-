/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F6FB',
        surface: '#FFFFFF',
        border: {
          DEFAULT: '#E7E8F2',
          strong: '#D7D9E8',
        },
        ink: {
          900: '#12142B',
          700: '#3D3F58',
          500: '#71738C',
          300: '#A6A8BE',
        },
        // Sidebar — dark navy-to-indigo gradient shell shared by every module
        sidebar: {
          from: '#0B1130',
          via: '#121A44',
          to: '#1C1B4B',
          border: 'rgba(255,255,255,0.08)',
          text: 'rgba(255,255,255,0.65)',
          textActive: '#FFFFFF',
        },
        // Primary brand blue
        accent: {
          50: '#EEF2FF',
          100: '#DDE4FE',
          300: '#A9B9FB',
          500: '#4361EE',
          600: '#3450D6',
          700: '#2A40B0',
        },
        // Secondary brand purple
        purple: {
          50: '#F3EFFE',
          100: '#E4DBFD',
          300: '#C3AEFA',
          500: '#8B5CF6',
          600: '#7A46F0',
          700: '#6C34E0',
        },
        success: { 50: '#E9FBF1', 100: '#D1F6E1', 500: '#22C55E', 600: '#17A34E', 700: '#0F7F3D' },
        warning: { 50: '#FFF6E9', 100: '#FEEAC7', 500: '#F59E0B', 600: '#DB8607', 700: '#B06B06' },
        danger: { 50: '#FDEEEE', 100: '#FBD9D9', 500: '#EF4444', 600: '#DC2626', 700: '#B41F1F' },
        info: { 50: '#EAF3FF', 100: '#D3E7FF', 500: '#3B82F6', 600: '#2E6BDB', 700: '#2555B0' },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
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
        18: '4.5rem',
        68: '17rem',
      },
      backgroundImage: {
        'sidebar-gradient': 'radial-gradient(circle at 20% 0%, #1C1B4B 0%, #121A44 45%, #0B1130 100%)',
        'banner-gradient': 'linear-gradient(115deg, #4361EE 0%, #6C4CF1 55%, #8B5CF6 100%)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'toast-in': { from: { opacity: 0, transform: 'translateY(-8px) scale(0.98)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'toast-in': 'toast-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
