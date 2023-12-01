import { useState, useEffect } from 'react';
import { Input } from '@nextui-org/react';
import { BodyText } from '@/components/Typography';

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

  const validatePassword = ({ target: { value } }: React.FocusEvent<HTMLInputElement>) => {
    console.log(value);
    // Password validation logic
    const hasValidLength = value.length >= 8;
    const hasNumber = /\d/.test(value);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValid = hasValidLength && hasNumber && hasSpecialCharacter;

    if (!isPasswordValid) {
      setIsConfirmPasswordValid(confirmPassword === value);
    }
    setHintColor(isValid ? 'success' : 'error');
    setIsPasswordValid(isValid);
  };

  return (
    <>
      <form className="flex flex-col my-8 gap-4 w-full items-centre">
        <Input
          isClearable
          variant="flat"
          placeholder="Enter 8-character password here"
          type="password"
          className="max-w-sm text-left"
          value={password}
          isInvalid={!isPasswordValid}
          onBlur={validatePassword}
          errorMessage={!isPasswordValid && password.length < 8 && 'Enter 8-character password here'}
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
          onBlur={() => setIsConfirmPasswordValid(confirmPassword === password)}
          isInvalid={!isPasswordValid || !isConfirmPasswordValid}
          errorMessage={!isConfirmPasswordValid && 'Passwords do not match'}
          onValueChange={setConfirmPassword}
          onClear={() => setConfirmPassword('')}
        />
        <BodyText className={VariantStyles[hintColor]}>
          <ul className="list-disc space-y-1 ml-5">
            <li>8 characters minimum</li>
            <li>Include 1 number (0-9)</li>
            <li>At least 1 special character (e.g., @, #, %)</li>
          </ul>
        </BodyText>
      </form>
      {/* <label>
        Enter password:
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-blue mt-4">
        Submit
      </button> */}
    </>
  );
}
