import { IMaskInput } from 'react-imask';

import { cnTw } from '@/shared/helpers';

type Props = {
  value: string;
  placeholder?: string;
  isValid: boolean;
  className?: string;
  onChange: (value: string) => void;
};

export const AmountInput = ({ value, placeholder = '0.00', isValid, className, onChange }: Props) => {
  const handleChange = (inputValue: string) => {
    // Skip onAccept from IMaskInput when new value set programmatically (came from props)
    if (inputValue === value) return;

    onChange(inputValue);
  };

  return (
    <IMaskInput
      className={cnTw(
        'h-10 w-full font-manrope text-large-title text-right bg-transparent transition-colors',
        'outline-none border-b-2 border-gray-300 focus:border-gray-500',
        !isValid && 'focus:border-danger',
        className,
      )}
      mask={Number}
      min={0}
      scale={15}
      value={value}
      radix="."
      mapToRadix={[',']}
      autofix={true}
      normalizeZeros={false}
      placeholder={placeholder}
      onAccept={handleChange}
    />
  );
};
