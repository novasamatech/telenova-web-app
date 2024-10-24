import { TextBase } from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/shared/helpers/twMerge';

export const HeadlineText = ({ className, ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-headline', className)} {...props} />
);
