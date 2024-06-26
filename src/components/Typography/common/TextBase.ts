import { createElement } from 'react';

import { cnTw } from '@/common/utils/twMerge';

import { type TypographyProps } from './types';

const TextBase = ({ as = 'p', align = 'left', className, children }: TypographyProps) => {
  return createElement(
    as,
    {
      className: cnTw(
        `text-text-primary font-manrope antialiased`,
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

export type TextBaseType = typeof TextBase;

export default TextBase;
