import { cnTw } from '@/shared/helpers/twMerge';

import './style.css';

type Props = {
  width?: number;
  height?: number;
  circle?: boolean;
  className?: string;
};

export const Shimmering = ({ width, height, circle, className }: Props) => (
  <span
    className={cnTw('spektr-shimmer block h-full w-full', circle ? 'rounded-full' : 'rounded-[10px]', className)}
    style={{ width: `${width}px`, height: `${circle ? width : height}px` }}
  />
);
