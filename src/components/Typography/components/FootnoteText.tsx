import { cnTw } from '@common/utils/twMerge';
import { TypographyProps } from '../common/types';
import TextBase from '../common/TextBase';

export const FootnoteText = ({ className, ...props }: TypographyProps) => (
  <TextBase className={cnTw('text-footnote font-manrope', className)} align="center" {...props} />
);
