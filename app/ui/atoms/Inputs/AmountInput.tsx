import { useEffect, useRef } from 'react';
import { IMaskInput } from 'react-imask';

import { cnTw } from '@/shared/helpers';

type Props = {
  value: string;
  placeholder?: string;
  isValid: boolean;
  autoFocus?: boolean;
  className?: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
};

export const AmountInput = ({
  value,
  placeholder = '0.00',
  isValid,
  autoFocus,
  className,
  onChange,
  onEnter,
}: Props) => {
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

  const handleChange = (inputValue: string) => {
    // Skip onAccept from IMaskInput when new value set programmatically (came from props)
    if (inputValue === value) return;

    onChange(inputValue);
  };

  return (
    <IMaskInput
      className={cnTw(
        'h-10 w-full bg-transparent text-right font-manrope text-large-title outline-none transition-colors',
        !isValid && 'text-text-danger',
        className,
      )}
      inputRef={ref}
      autoFocus={autoFocus}
      inputMode="decimal"
      mask={Number}
      min={0}
      scale={15}
      value={value}
      radix="."
      mapToRadix={[',']}
      autofix={true}
      normalizeZeros={true}
      placeholder={placeholder}
      onAccept={handleChange}
    />
  );
};
