import { type ComponentProps } from 'react';

import { useToggle } from '@/shared/hooks';
import { Icon } from '@/ui/atoms';

import { Input } from './Input';

type Props = ComponentProps<typeof Input>;

export const PasswordInput = (props: Props) => {
  const [isVisible, toggleVisible] = useToggle();

  return (
    <Input
      {...props}
      endContent={
        <button type="button" className="flex items-center" onClick={toggleVisible}>
          {isVisible ? <Icon name="Hide" /> : <Icon name="Show" />}
        </button>
      }
      type={isVisible ? 'text' : 'password'}
    />
  );
};
