import { type ElementType, type PropsWithChildren } from 'react';

import { cnTw } from '@/shared/helpers/twMerge';

type Props = {
  as?: ElementType;
  className?: string;
};

export const Plate = ({ as: Tag = 'div', className, children }: PropsWithChildren<Props>) => (
  <Tag className={cnTw('break-words rounded-lg bg-white p-4', className)}>{children}</Tag>
);
