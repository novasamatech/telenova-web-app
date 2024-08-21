import { TextBase } from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/shared/helpers/twMerge';

export const LargeTitleText = ({ as = 'h1', className, ...props }: TypographyProps) => (
  <TextBase as={as} className={cnTw('text-large-title', className)} {...props} />
);
