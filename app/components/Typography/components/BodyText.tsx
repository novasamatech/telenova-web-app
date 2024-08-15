import { TextBase } from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/shared/helpers/twMerge';

export const BodyText = ({ className, ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-body', className)} align="center" {...props} />
);
