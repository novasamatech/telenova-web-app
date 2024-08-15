import React, { useEffect, useState } from 'react';

import { Input } from '../Input/Input';
import { BodyText } from '../Typography';

import { cnTw } from '@/shared/helpers/twMerge';

type Variants = 'error' | 'success' | 'default';

const VariantStyles: Record<Variants, string> = {
  success: 'text-text-positive',
  error: 'text-text-danger',
  default: 'text-text-hint',
};

type Props = {
  onSubmit: (password: string) => void;
};

export const PasswordForm = ({ onSubmit }: Props) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [hintColor, setHintColor] = useState<Variants>('default');

  useEffect(() => {
    if (password.length === 0 || !isPasswordValid || password !== confirmPassword) {
      return;
    }
    onSubmit(password);
  }, [password, confirmPassword, isPasswordValid, isConfirmPasswordValid]);

  const validatePassword = (value: string) => {
    // Password validation logic
    const regex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    const hasValidFormat = regex.test(value);

    if (confirmPassword.length !== 0) {
      setIsConfirmPasswordValid(confirmPassword === value);
    }
    setHintColor(hasValidFormat ? 'success' : 'error');
    setIsPasswordValid(hasValidFormat);
  };

  const validateOnChange = (value: string) => {
    setPassword(value);
    if (isDirty) {
      validatePassword(value);
    }
  };

  const validateConfirmPassword = (value: string) => {
    setIsConfirmPasswordValid(value === password);
    setConfirmPassword(value);
  };

  const validateOnBlur = () => {
    setIsDirty(true);
    validatePassword(password);
  };
  // TODO: return btn on keyboard

  return (
    <form className="mt-8 flex w-full flex-col items-center gap-4">
      <Input
        isClearable
        variant="flat"
        placeholder="Enter Password Here"
        type="password"
        className="max-w-sm text-left"
        value={password}
        isInvalid={!isPasswordValid}
        errorMessage={!isPasswordValid && 'Enter correct password here'}
        onBlur={validateOnBlur}
        onValueChange={validateOnChange}
        onClear={() => setPassword('')}
      />
      <Input
        isClearable
        variant="flat"
        placeholder="Confirm Password"
        type="password"
        className="max-w-sm text-left"
        value={confirmPassword}
        isInvalid={!isConfirmPasswordValid}
        errorMessage={!isConfirmPasswordValid && 'Passwords did not match'}
        onValueChange={validateConfirmPassword}
        onClear={() => setConfirmPassword('')}
      />
      <BodyText align="left" as="span" className={cnTw('mt-4 self-start', VariantStyles[hintColor])}>
        <ul className="mb-1 ml-5 list-disc space-y-1">
          <li className={password.length >= 8 ? VariantStyles.success : ''}>8 characters minimum</li>
          <li className={cnTw(/\d/.test(password) && VariantStyles.success)}>Include at least 1 number (0-9)</li>
          <li className={cnTw(/[a-zA-Z]/.test(password) && VariantStyles.success)}>Include at least 1 letter (A-z)</li>
        </ul>
        <BodyText align="left" className="text-text-hint">
          Make your password stronger - special characters (e.g., @, #, %) and uppercase letters are recommended
        </BodyText>
      </BodyText>
    </form>
  );
};
