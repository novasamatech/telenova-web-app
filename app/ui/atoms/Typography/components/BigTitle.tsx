import { TextBase } from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/shared/helpers/twMerge';

export const BigTitle = ({ as = 'h2', className, ...props }: TypographyProps) => (
  <TextBase as={as} className={cnTw('text-big-title', className)} align="center" {...props} />
);
