import { cnTw } from '@common/utils/twMerge';
import { TypographyProps } from '../common/types';
import TextBase from '../common/TextBase';

export const BodyText = ({ className, ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-body', className)} align="center" {...props} />
);
