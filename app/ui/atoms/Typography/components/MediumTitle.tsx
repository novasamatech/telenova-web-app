import { TextBase } from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/shared/helpers/twMerge';

export const MediumTitle = ({ className, ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-medium-title', className)} {...props} />
);
