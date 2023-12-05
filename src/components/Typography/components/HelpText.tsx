import { cnTw } from '@common/utils/twMerge';
import { TypographyProps } from '../common/types';
import TextBase from '../common/TextBase';

export const HelpText = ({ className, ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-help-text', className)} {...props} />
);