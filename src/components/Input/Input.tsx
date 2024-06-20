import { type FC } from 'react';

// import { type InputProps } from '@nextui-org/input';
import { type InputProps, Input as NextUiInput } from '@nextui-org/react';

export const Input: FC<Omit<InputProps, 'classNames'>> = props => {
  return (
    <NextUiInput
      {...props}
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
