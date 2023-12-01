import { cnTw } from '@common/utils/twMerge';
import TextBase from '../common/TextBase';
import { TypographyProps } from '../common/types';

export const TitleText = ({ className, as = 'h2', ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-title font-manrope', className)} as={as} align='center' {...props} />
);
