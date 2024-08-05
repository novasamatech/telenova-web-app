import { TextBase } from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/common/utils/twMerge';

export const HelpText = ({ className, as = 'span', ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-help-text', className)} as={as} {...props} />
);
