import cn from 'classnames';
import { extendTailwindMerge } from 'tailwind-merge';

import fontSizes from '../../../tw-config-consts/font-sizes';

type CnArgs = Parameters<typeof cn>;

const fonts = Object.keys(fontSizes as { [key: string]: object });

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: fonts,
        },
      ],
    },
  },
});

/**
 * Merge CSS classes
 * use Tailwind Merge internally to overcome Tailwind styling cascade
 * @param args list of arguments for <b>cn</b>
 * @return {String}
 */
export const cnTw = (...args: CnArgs): string => twMerge(cn(args));
