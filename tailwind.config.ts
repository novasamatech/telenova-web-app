import type { Config } from 'tailwindcss';

import { nextui } from '@nextui-org/react';

import colors from './tw-config-consts/colors';
import fontSize from './tw-config-consts/font-sizes';

export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        'md-sm': '0px 3px 4px 0px #E0E4F5, 0px 1px 1px 0px #C8CBD9',
      },
      dropShadow: {
        button: ['0px 1px 4px #E0E4F5', '0px 1px 1px #C8CBD9'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors,
      fontSize,
    },
  },
  darkMode: 'class',
  plugins: [nextui()],
} satisfies Config;
