import { cnTw } from '@common/utils/twMerge';
import TextBase from '../common/TextBase';
import { TypographyProps } from '../common/types';

export const BigTitle = ({ className, as = 'h2', ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-big-title', className)} as={as} align="center" {...props} />
);
