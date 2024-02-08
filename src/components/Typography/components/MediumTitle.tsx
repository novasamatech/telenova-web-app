import { cnTw } from '@common/utils/twMerge';
import { TypographyProps } from '../common/types';
import TextBase from '../common/TextBase';

export const MediumTitle = ({ className, ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-medium-title', className)} {...props} />
);
