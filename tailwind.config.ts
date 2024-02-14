import type { Config } from 'tailwindcss';
const { nextui } = require('@nextui-org/react');

import fontSizes from './tw-config-consts/font-sizes';
import colors from './tw-config-consts/colors';
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  mode: 'jit',
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/screens/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/common/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['var(--font-manrope)'],
      },
      dropShadow: {
        button: '0px 2px 2px var(--Color-Shadow-color-shadow-second-layer, #B2B5C8)',
      },
      fontSize: fontSizes,
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        ...colors,
      },
    },
  },
  darkMode: 'class',
  plugins: [nextui()],
} satisfies Config;
