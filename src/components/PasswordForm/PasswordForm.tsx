import React, { useState, useEffect } from 'react';
import { Input } from '@nextui-org/react';

import { BodyText } from '@/components/Typography';
import { cnTw } from '@/common/utils/twMerge';

interface PasswordFormProps {
  onSubmit: (password: string) => void;
}
type Variants = 'error' | 'success' | 'default';
const VariantStyles: Record<Variants, string> = {
  success: 'text-text-positive',
  error: 'text-text-danger',
  default: 'text-text-hint',
};

export default function PasswordForm({ onSubmit }: PasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const [hintColor, setHintColor] = useState<Variants>('default');

  useEffect(() => {
    if (password.length === 0 || !isPasswordValid || !isConfirmPasswordValid || password !== confirmPassword) return;
    onSubmit(password);
  }, [password, confirmPassword, isPasswordValid, isConfirmPasswordValid]);

  const validatePassword = (e: React.FocusEvent) => {
    const { value } = e.target as HTMLInputElement;
    // Password validation logic
    const hasValidLength = value.length >= 8;
    const hasNumber = /\d/.test(value);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValid = hasValidLength && hasNumber && hasSpecialCharacter;

    if (confirmPassword.length !== 0) {
      setIsConfirmPasswordValid(confirmPassword === value);
    }
    setHintColor(isValid ? 'success' : 'error');
    setIsPasswordValid(isValid);
  };

  return (
    <form className="flex flex-col my-8 gap-4 w-full items-center">
      <Input
        isClearable
        variant="flat"
        placeholder="Enter 8-character password here"
        type="password"
        className="max-w-sm text-left"
        value={password}
        isInvalid={!isPasswordValid}
        errorMessage={!isPasswordValid && password.length < 8 && 'Enter 8-character password here'}
        onBlur={validatePassword}
        onValueChange={setPassword}
        onClear={() => setPassword('')}
      />
      <Input
        isClearable
        variant="flat"
        placeholder="Confirm password"
        type="password"
        className="max-w-sm"
        value={confirmPassword}
        isInvalid={!isPasswordValid || !isConfirmPasswordValid}
        errorMessage={!isConfirmPasswordValid && 'Passwords do not match'}
        onBlur={() => setIsConfirmPasswordValid(confirmPassword === password)}
        onValueChange={setConfirmPassword}
        onClear={() => setConfirmPassword('')}
      />
      <BodyText as="span" className={cnTw('self-start', VariantStyles[hintColor])}>
        <ul className="list-disc space-y-1 ml-5">
          <li>8 characters minimum</li>
          <li>Include 1 number (0-9)</li>
          <li>At least 1 special character (e.g., @, #, %)</li>
        </ul>
      </BodyText>
    </form>
  );
}
