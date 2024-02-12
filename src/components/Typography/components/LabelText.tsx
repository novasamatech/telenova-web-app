import { cnTw } from '@common/utils/twMerge';
import TextBase from '../common/TextBase';
import { TypographyProps } from '../common/types';

export const LabelText = ({ className = 'text-text-primary', ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-label', className)} {...props} />
);
