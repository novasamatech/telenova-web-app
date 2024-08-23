import { type ComponentPropsWithoutRef, type ElementType, type PropsWithChildren } from 'react';

import { cnTw } from '@/shared/helpers/twMerge';

type AsProp<T extends ElementType> = {
  component?: T;
} & ComponentPropsWithoutRef<T>;

type Props<T extends ElementType> = AsProp<T> & {
  className?: string;
};

export const Plate = <T extends ElementType = 'div'>({
  component,
  className,
  children,
}: PropsWithChildren<Props<T>>) => {
  const Component = component || 'div';

  return <Component className={cnTw('break-words rounded-lg bg-white p-4', className)}>{children}</Component>;
};
