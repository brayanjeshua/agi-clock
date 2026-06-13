/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        danger: '#ff4444',
        'danger-dim': '#ff444433',
      },
    },
  },
  plugins: [],
};
