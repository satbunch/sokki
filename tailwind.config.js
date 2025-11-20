/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Semantic colors
        primary: {
          DEFAULT: '#007AFF',
          dark: '#0051D5',
        },
        success: {
          DEFAULT: '#34C759',
          dark: '#248A3D',
        },
        error: {
          DEFAULT: '#ff3b30',
          hover: '#ff453a',
        },
        // Light theme backgrounds
        light: {
          tabbar: 'rgba(167, 159, 155, 1)',
          icon: 'rgba(167, 159, 155, 1)',
          tooltip: 'rgba(20, 20, 20, 0.95)',
          container: 'rgba(255, 255, 255, 0.85)',
          header: 'rgba(255, 255, 255, 0.4)',
          'tab-inactive': 'rgba(167, 159, 155, 1)',
          editor: 'rgba(195, 189, 182, 1)',
        },
        // Dark theme backgrounds
        dark: {
          container: 'rgba(30, 30, 30, 0.95)',
          header: 'rgba(255, 255, 255, 0.05)',
          tooltip: 'rgba(40, 40, 40, 0.98)',
          tabbar: 'rgba(51, 48, 48, 1)',
          icon: 'rgba(51, 48, 48, 1)',
          'tab-inactive': 'rgba(51, 48, 48, 1)',
          editor: 'rgba(73, 73, 76, 1)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Monaco', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'mac': '6px',
        'mac-lg': '12px',
      },
      backdropBlur: {
        'mac': '40px',
      },
      backdropSaturate: {
        'mac': '180%',
      },
    },
  },
  plugins: [],
}
