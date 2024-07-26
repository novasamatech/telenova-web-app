import { Button } from '@nextui-org/react';

import { LabelText } from '../Typography';

import { Icon } from './Icon';
import { type IconNames } from './types';

type Props = {
  iconName: IconNames;
  size?: number;
  className?: string;
  text?: string;
  onClick: () => void;
};

export const IconButton = ({ iconName, onClick, size = 40, text = '' }: Props) => {
  return (
    <Button
      variant="shadow"
      className="bg-white h-auto w-full px-3 py-[14px] gap-3 justify-start rounded-[20px] flex-col shadow-md-sm"
      onClick={onClick}
    >
      <span className="w-[40px]">
        <Icon name={iconName} size={size} className="text-[--tg-theme-button-color]" />
      </span>
      <LabelText as="span">{text}</LabelText>
    </Button>
  );
};
