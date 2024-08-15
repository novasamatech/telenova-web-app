import { TextBase } from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/shared/helpers/twMerge';

export const TitleText = ({ className, as = 'h2', ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-title', className)} as={as} align="center" {...props} />
);
