import { Button } from '@nextui-org/react';
import { Icon, LabelText } from '@/components';
import { IconNames } from './types';

type Props = {
  iconName: IconNames;
  size?: number;
  className?: string;
  text?: string;
  onClick: () => void;
};

const IconButton = ({ iconName, onClick, size = 40, text = '' }: Props) => {
  return (
    <div className="grid">
      <Button
        radius="full"
        variant="shadow"
        className="bg-white h-full w-full p-1 gap-4 justify-start border border-border-neutral shadow-button"
        onClick={onClick}
      >
        <Icon name={iconName} size={size} className="text-[--tg-theme-button-color]" />
        <LabelText as="span">{text}</LabelText>
      </Button>
    </div>
  );
};

export default IconButton;
