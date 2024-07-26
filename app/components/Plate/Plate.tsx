import { type ElementType, type PropsWithChildren } from 'react';

import { cnTw } from '@/common/utils/twMerge';

type Props = {
  as?: ElementType;
  className?: string;
};

export const Plate = ({ as: Tag = 'div', className, children }: PropsWithChildren<Props>) => (
  <Tag className={cnTw('p-4 rounded-lg bg-white break-words', className)}>{children}</Tag>
);
