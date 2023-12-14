import { Button } from '@nextui-org/react';
import { FootnoteText, Icon } from '@/components';
import { IconNames } from './types';

type Props = {
  iconName: IconNames;
  size?: number;
  className?: string;
  alt?: string;
  text?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  onClick: () => void;
};

const IconButton = ({ iconName, onClick, size = 40, className, text = '', color }: Props) => {
  return (
    <div className="text-center grid gap-2 justify-items-center">
      <Button radius="full" isIconOnly color={color} variant="shadow" onClick={onClick}>
        <Icon name={iconName} size={size} className={className} alt={text} />
      </Button>
      <FootnoteText as="span">{text}</FootnoteText>
    </div>
  );
};

export default IconButton;
