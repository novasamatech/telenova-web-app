import { Link } from 'react-router-dom';
import { cnTw } from '@/common/utils/twMerge';
import { BodyText, HelpText, Icon } from '@/components';
import { IconNames } from '../Icon/types';

type Props = {
  text: string;
  href?: string;
  iconName?: IconNames;
  helpText?: string;
  valueText?: string;
  showArrow?: boolean;
  iconClassName?: string;
  textClassName?: string;
  className?: string;
  onClick?: () => void;
};

const LinkCard = ({
  href = '',
  onClick,
  iconName,
  className,
  iconClassName,
  text,
  textClassName,
  helpText,
  valueText,
  showArrow,
}: Props) => (
  <Link
    to={href}
    className={cnTw(`w-full grid grid-cols-[auto,1fr,auto] items-center gap-4 h-[48px] pl-4 pr-2 ${className}`)}
    onClick={onClick}
  >
    {iconName && <Icon name={iconName} className={cnTw(`w-10 h-10 ${iconClassName}`)} />}
    <div className="grid">
      <BodyText align="left" className={textClassName}>
        {text}
      </BodyText>
      {helpText && <HelpText className="text-text-hint">{helpText}</HelpText>}
    </div>
    {valueText && <HelpText className="text-text-hint">{valueText}</HelpText>}
    {showArrow && <Icon name="chevronForward" className="w-4 h-4 self-center" />}
  </Link>
);

export default LinkCard;
