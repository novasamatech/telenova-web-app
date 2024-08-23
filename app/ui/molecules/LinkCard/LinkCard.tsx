import { Link } from 'react-router-dom';

import { Icon } from '../../atoms/Icon/Icon.tsx';
import { type IconNames } from '../../atoms/Icon/types';
import { Plate } from '../../atoms/Plate/Plate.tsx';
import { BodyText, HelpText } from '../../atoms/Typography';

import { cnTw } from '@/shared/helpers/twMerge';

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

export const LinkCard = ({
  href = '',
  iconName,
  className,
  iconClassName,
  wrapperClassName,
  text,
  textClassName,
  helpText,
  valueText,
  showArrow,
  onClick,
}: Props) => (
  <Plate className={cnTw(`w-full p-0 hover:bg-bg-item-pressed active:bg-bg-item-pressed`, wrapperClassName)}>
    <Link
      to={href}
      className={cnTw(`grid min-h-[56px] w-full grid-cols-[auto,1fr,auto] items-center gap-3 px-4`, className)}
      onClick={onClick}
    >
      {iconName && <Icon name={iconName} className={cnTw(`h-10 w-10`, iconClassName)} />}
      <div className="grid">
        <BodyText align="left" className={textClassName}>
          {text}
        </BodyText>
        {helpText && <HelpText className="text-text-hint">{helpText}</HelpText>}
      </div>
      {valueText && <BodyText className="text-text-hint">{valueText}</BodyText>}
      {showArrow && <Icon name="ChevronForward" className="h-4 w-4 self-center" />}
    </Link>
  </Plate>
);
