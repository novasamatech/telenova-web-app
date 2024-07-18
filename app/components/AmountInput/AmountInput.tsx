import { IMaskInput } from 'react-imask';

import { cnTw } from '@/common/utils';

type Props = {
  value: string;
  placeholder?: string;
  isValid: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
  onChange: (value: string) => void;
};

export const AmountInput = ({
  value,
  placeholder = '0.00',
  isValid,
  wrapperClassName,
  inputClassName,
  onChange,
}: Props) => {
  return (
    <div className={cnTw('px-1', wrapperClassName)}>
      <IMaskInput
        className={cnTw(
          'h-10 w-full font-manrope text-large-title text-right bg-transparent transition-colors',
          'outline-none border-b-2 border-gray-300 focus:border-gray-500',
          !isValid && 'focus:border-danger',
          inputClassName,
        )}
        mask={Number}
        min={0}
        scale={15}
        value={value}
        radix="."
        mapToRadix={[',']}
        autofix={true}
        placeholder={placeholder}
        onAccept={onChange}
      />
    </div>
  );
};
