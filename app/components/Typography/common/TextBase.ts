import { createElement } from 'react';

import { cnTw } from '@/shared/helpers/twMerge';

import { type TypographyProps } from './types';

export const TextBase = ({ as = 'p', align = 'left', className, children }: TypographyProps) => {
  return createElement(
    as,
    {
      className: cnTw(
        `font-manrope text-text-primary antialiased`,
        {
          'text-left': align === 'left',
          'text-right': align === 'right',
          'text-center': align === 'center',
        },
        className,
      ),
    },
    children,
  );
};
