import { cnTw } from '@common/utils/twMerge';
import { TypographyProps } from '../common/types';
import TextBase from '../common/TextBase';

export const HeadlineText = ({ className, ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-headline', className)} {...props} />
);
