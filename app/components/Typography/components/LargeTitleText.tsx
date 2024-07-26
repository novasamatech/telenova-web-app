import { TextBase } from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/common/utils/twMerge';

export const LargeTitleText = ({ className, as = 'h1', ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-large-title', className)} as={as} {...props} />
);
