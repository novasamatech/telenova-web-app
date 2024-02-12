import { Link } from 'react-router-dom';

import { cnTw } from '@/common/utils/twMerge';
import { BodyText, HelpText, Icon, Plate } from '@/components';
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
  wrapperClassName?: string;
  onClick?: () => void;
};

const LinkCard = ({
  href = '',
  onClick,
  iconName,
  className,
  iconClassName,
  wrapperClassName,
  text,
  textClassName,
  helpText,
  valueText,
  showArrow,
}: Props) => (
  <Plate className={cnTw(`w-full p-0 hover:bg-bg-item-pressed active:bg-bg-item-pressed`, wrapperClassName)}>
    <Link
      to={href}
      className={cnTw(`w-full grid grid-cols-[auto,1fr,auto] items-center gap-4 min-h-[48px] px-4`, className)}
      onClick={onClick}
    >
      {iconName && <Icon name={iconName} className={cnTw(`w-10 h-10`, iconClassName)} />}
      <div className="grid">
        <BodyText align="left" className={textClassName}>
          {text}
        </BodyText>
        {helpText && <HelpText className="text-text-hint">{helpText}</HelpText>}
      </div>
      {valueText && <BodyText className="text-text-hint">{valueText}</BodyText>}
      {showArrow && <Icon name="chevronForward" className="w-4 h-4 self-center" />}
    </Link>
  </Plate>
);

export default LinkCard;
