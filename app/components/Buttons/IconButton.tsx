import { Button } from '@nextui-org/react';

import { Icon } from '../Icon/Icon';
import { type IconNames } from '../Icon/types';
import { LabelText } from '../Typography';

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
      className="h-auto w-full flex-col justify-start gap-3 rounded-[20px] bg-white px-3 py-[14px] shadow-md-sm"
      onClick={onClick}
    >
      <span className="w-[40px]">
        <Icon name={iconName} size={size} className="text-[--tg-theme-button-color]" />
      </span>
      <LabelText as="span">{text}</LabelText>
    </Button>
  );
};
