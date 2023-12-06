import { ElementType, PropsWithChildren } from 'react';
import { cnTw } from '@/common/utils/twMerge';

type Props = {
  as?: ElementType;
  className?: string;
};

const Plate = ({ as: Tag = 'div', className, children }: PropsWithChildren<Props>) => (
  <Tag className={cnTw('p-3 rounded-3xl bg-white', className)}>{children}</Tag>
);

export default Plate;
