import { createElement } from 'react';

import { cnTw } from '@common/utils/twMerge';
import { TypographyProps } from './types';

const TextBase = ({ as = 'p', align = 'left', className, children }: TypographyProps) => {
  return createElement(
    as,
    { className: cnTw(`text-${align} text-text-primary font-manrope antialiased`, className) },
    children,
  );
};

export type TextBaseType = typeof TextBase;

export default TextBase;
