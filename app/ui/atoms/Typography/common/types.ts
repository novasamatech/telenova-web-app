import { type PropsWithChildren } from 'react';

export type Tags = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span';

export type Align = 'left' | 'right' | 'center';

type Props = {
  as?: Tags;
  id?: string;
  align?: Align;
  className?: string;
};

export type TypographyProps = PropsWithChildren<Props>;
