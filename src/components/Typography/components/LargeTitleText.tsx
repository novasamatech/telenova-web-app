import { cnTw } from '@common/utils/twMerge';
import TextBase from '../common/TextBase';
import { TypographyProps } from '../common/types';

export const LargeTitleText = ({ className, as = 'h1', ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-large-title', className)} as={as} {...props} />
);
