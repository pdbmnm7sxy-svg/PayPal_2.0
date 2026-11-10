import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#dbe5f2',
          200: '#bccfe5',
          300: '#90b2d4',
          400: '#5e90bf',
          500: '#3c72a8',
          600: '#2c598c',
          700: '#234670',
          800: '#1c3658',
          900: '#0c2340', // Deep financial navy from screenshots
          950: '#061323',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9e0fe',
          300: '#7cc4fd',
          400: '#36a7f9',
          500: '#0070e0', // Classic financial action blue
          600: '#005cb8',
          700: '#004aa3',
          800: '#003087',
          900: '#072b64',
          950: '#04193b',
        },
      },
    },
  },
  plugins: [],
};

export default config;
