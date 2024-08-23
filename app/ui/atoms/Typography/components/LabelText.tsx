import { TextBase } from '../common/TextBase';
import { type TypographyProps } from '../common/types';

import { cnTw } from '@/shared/helpers/twMerge';

export const LabelText = ({ className = 'text-text-primary', ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-label', className)} {...props} />
);
