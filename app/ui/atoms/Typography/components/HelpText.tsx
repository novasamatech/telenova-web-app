import { TextBase } from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/shared/helpers/twMerge';

export const HelpText = ({ as = 'span', className, ...props }: TypographyProps) => (
  <TextBase as={as} className={cnTw('text-help-text', className)} {...props} />
);
