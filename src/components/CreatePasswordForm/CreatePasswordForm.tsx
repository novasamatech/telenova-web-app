import React, { type FC, useEffect, useState } from 'react';

import { cnTw } from '@/common/utils/twMerge';
import { BodyText, Input } from '@/components';

interface PasswordFormProps {
  password: string;
  onStatusChange: (completed: boolean) => void;
  onChange: (password: string) => void;
}

type Variants = 'error' | 'success' | 'default';
const VariantStyles: Record<Variants, string> = {
  success: 'text-text-positive',
  error: 'text-text-danger',
  default: 'text-text-hint',
};

export const CreatePasswordForm: FC<PasswordFormProps> = ({ password, onStatusChange, onChange }) => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const completed = password.length > 0 && isPasswordValid && password == confirmPassword;

    onStatusChange(completed);
  }, [password, confirmPassword, isPasswordValid, onStatusChange]);

  const validatePassword = (value: string) => {
    // Password validation logic
    const regex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    const hasValidFormat = regex.test(value);

    setIsPasswordValid(hasValidFormat);
  };

  const validateOnChange = (value: string) => {
    onChange(value);
    if (touched) {
      validatePassword(value);
    }
  };

  const validateOnBlur = () => {
    setTouched(true);
    validatePassword(password);
  };

  const isConfirmInvalid = confirmPassword.length > 0 && confirmPassword !== password;
  const hintColor = touched ? (isPasswordValid ? 'success' : 'error') : 'default';

  return (
    <form className="flex flex-col mt-8 gap-4 w-full items-center">
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
        onClear={() => onChange('')}
      />
      <Input
        isClearable
        variant="flat"
        placeholder="Confirm Password"
        type="password"
        className="max-w-sm text-left"
        value={confirmPassword}
        isInvalid={isConfirmInvalid}
        errorMessage={isConfirmInvalid && 'Passwords did not match'}
        onValueChange={setConfirmPassword}
        onClear={() => setConfirmPassword('')}
      />
      <BodyText align="left" as="span" className={cnTw('self-start mt-4', VariantStyles[hintColor])}>
        <ul className="list-disc space-y-1 ml-5 mb-1">
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
