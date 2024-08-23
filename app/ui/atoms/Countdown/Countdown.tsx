import { type ComponentPropsWithoutRef, type ElementType, useEffect, useState } from 'react';

type AsProp<T extends ElementType> = {
  component?: T;
} & ComponentPropsWithoutRef<T>;

type Props<T extends ElementType> = AsProp<T> & {
  initValue: number;
  className?: string;
  onFinish: () => void;
};

export const Countdown = <T extends ElementType = 'span'>({ component, initValue, onFinish, ...rest }: Props<T>) => {
  const Component = component || 'span';

  const [counter, setCounter] = useState(initValue);

  useEffect(() => {
    if (counter === 0) {
      onFinish();

      return;
    }
    const timer = setTimeout(() => setCounter(counter - 1), 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [counter]);

  if (counter === 0) return '';

  return <Component {...rest}>({counter} sec)</Component>;
};
