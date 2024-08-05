import { cnTw } from '@/common/utils/twMerge';

import './style.css';

type Props = {
  width?: number;
  height?: number;
  circle?: boolean;
  className?: string;
};

export const Shimmering = ({ width, height, circle, className }: Props) => (
  <span
    className={cnTw('h-full w-full block spektr-shimmer', circle ? 'rounded-full' : 'rounded-[10px]', className)}
    style={{ width: `${width}px`, height: `${circle ? width : height}px` }}
  />
);
