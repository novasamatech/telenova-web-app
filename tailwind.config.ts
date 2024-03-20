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
      boxShadow: {
        'md-sm': '0px 3px 4px 0px #E0E4F5, 0px 1px 1px 0px #C8CBD9',
      },
      dropShadow: {
        button: ['0px 3px 4px #E0E4F5', '0px 1px 1px #C8CBD9'],
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
