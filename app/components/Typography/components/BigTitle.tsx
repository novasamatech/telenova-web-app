import TextBase from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/common/utils/twMerge';

export const BigTitle = ({ className, as = 'h2', ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-big-title', className)} as={as} align="center" {...props} />
);
