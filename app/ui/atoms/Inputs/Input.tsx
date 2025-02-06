import { useEffect, useRef } from 'react';

import { type InputProps, Input as NextUiInput } from '@nextui-org/react';

type Props = Omit<InputProps, 'classNames'> & {
  onEnter?: () => void;
};

export const Input = ({ onEnter, ...props }: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onEnter?.();
      }
    };

    ref.current?.addEventListener('keydown', handler);

    return () => {
      ref.current?.removeEventListener('keydown', handler);
    };
  }, [onEnter]);

  return (
    <NextUiInput
      {...props}
      ref={ref}
      classNames={{
        inputWrapper: [
          'bg-bg-input border-1 shadow-none h-14',
          'rounded-lg group-data-[focus=true]:bg-bg-input group-data-[focus=true]:border-border-active',
          props.isInvalid && 'border-border-danger',
        ],
        clearButton: ['text-text-hint'],
      }}
    />
  );
};
