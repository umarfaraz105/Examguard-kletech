import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // KLE Brand Colors - Comprehensive palette
      colors: {
        // Primary Brand (KLE Red)
        primary: {
          50: '#FDECEF',
          100: '#FAD9DF', 
          200: '#F5B3BF',
          300: '#F08D9F',
          400: '#E5677F',
          500: '#C8102E', // Main KLE Red
          600: '#9B0C23',
          700: '#6E0818',
          800: '#41050E',
          900: '#140203',
          DEFAULT: '#C8102E',
          foreground: '#FFFFFF',
        },
        
        // Semantic Colors
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          DEFAULT: '#10B981',
        },
        
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          DEFAULT: '#F59E0B',
        },
        
        error: {
          50: '#FDECEF',
          100: '#FAD9DF',
          200: '#F5B3BF',
          300: '#F08D9F',
          400: '#E5677F',
          500: '#C8102E', // Use KLE red for consistency
          600: '#9B0C23',
          700: '#6E0818',
          800: '#41050E',
          900: '#140203',
          DEFAULT: '#C8102E',
        },
        
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          DEFAULT: '#3B82F6',
        },
        
        // Neutral grays
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        
        // Legacy KLE variables (maintain compatibility)
        text: {
          DEFAULT: '#111111',
          muted: '#6B7280',
        },
        bg: '#F9FAFB',
        surface: '#FFFFFF', 
        border: '#E5E7EB',
        
        // Shadcn/ui compatibility
        background: '#F9FAFB',
        foreground: '#111111',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111111',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111111',
        },
        secondary: {
          DEFAULT: '#F3F4F6',
          foreground: '#111111',
        },
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#FDECEF',
          foreground: '#C8102E',
        },
        destructive: {
          DEFAULT: '#C8102E',
          foreground: '#FFFFFF',
        },
        input: '#E5E7EB',
        ring: '#C8102E',
      },
      
      // Enhanced typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],  // 10px
        xs: ['0.75rem', { lineHeight: '1rem' }],          // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],      // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],         // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],      // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],       // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1' }],             // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],          // 60px
      },
      
      // Consistent spacing scale
      spacing: {
        '4.5': '1.125rem', // 18px
        '5.5': '1.375rem', // 22px
        '13': '3.25rem',   // 52px
        '15': '3.75rem',   // 60px
        '17': '4.25rem',   // 68px
        '18': '4.5rem',    // 72px
        '19': '4.75rem',   // 76px
        '21': '5.25rem',   // 84px
        '22': '5.5rem',    // 88px
        '88': '22rem',     // 352px
        '100': '25rem',    // 400px
        '104': '26rem',    // 416px
        '112': '28rem',    // 448px
        '128': '32rem',    // 512px
      },
      
      // Enhanced border radius
      borderRadius: {
        '4xl': '2rem',    // 32px
        '5xl': '2.5rem',  // 40px
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      
      // Enhanced shadows for depth
      boxShadow: {
        'kle': '0 1px 3px 0 rgb(200 16 46 / 0.1), 0 1px 2px -1px rgb(200 16 46 / 0.1)',
        'kle-md': '0 4px 6px -1px rgb(200 16 46 / 0.1), 0 2px 4px -2px rgb(200 16 46 / 0.1)',
        'kle-lg': '0 10px 15px -3px rgb(200 16 46 / 0.1), 0 4px 6px -4px rgb(200 16 46 / 0.1)',
        'inner-kle': 'inset 0 2px 4px 0 rgb(200 16 46 / 0.05)',
      },
      
      // Animation enhancements  
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Enhanced grid system
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
