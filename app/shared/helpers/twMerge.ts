import cn from 'classnames';
import { extendTailwindMerge } from 'tailwind-merge';

import extendedColors from '../config/tailwind/colors';
import extendedFonts from '../config/tailwind/font-sizes';

const fonts = Object.keys(extendedFonts as Record<string, unknown>);
const colors = Object.keys(extendedColors as Record<string, unknown>);

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: fonts }],
      'font-weight': [{ text: fonts }],
      leading: [{ text: fonts }],
      tracking: [{ text: fonts }],
      'bg-color': [{ bg: colors }],
      'text-color': [{ text: colors }],
      'border-color': [{ border: colors }],
    },
  },
});

/**
 * Merge CSS classes use Tailwind Merge internally to overcome Tailwind styling
 * cascade
 *
 * @param args List of arguments for <b>cn</b>
 *
 * @returns {String}
 */
export function cnTw(...args: Parameters<typeof cn>): string {
  return twMerge(cn(args));
}
