import { Icon } from '../../atoms/Icon/Icon';
import { Plate } from '../../atoms/Plate/Plate';
import { HelpText, MediumTitle } from '../../atoms/Typography';

import { cnTw, toFormattedBalance } from '@/shared/helpers';
import { type Gift } from '@/types/substrate';

type Props = {
  gift: Gift;
  isClaimed: boolean;
};

export const GiftPlate = ({ gift, isClaimed }: Props) => {
  const date = new Date(gift.timestamp).toLocaleString();

  return (
    <Plate className="mb-2 grid grid-cols-[40px,1fr,auto] items-center gap-x-3">
      <Icon name="Gift" className={cnTw(`h-10 w-10`, isClaimed ? 'text-bg-icon-accent-primary' : 'text-text-hint')} />
      <div>
        <MediumTitle>
          {/* Balance for old gifts are already formatted */}
          {gift.chainIndex === undefined
            ? `${gift.balance}`
            : `${toFormattedBalance(gift.balance, gift.asset.precision).formatted}`}
          &nbsp;{gift.asset.symbol}
        </MediumTitle>
        <HelpText as="p" className="text-text-hint">
          Created: {date}
        </HelpText>
        <HelpText as="p" className={gift.status === 'Unclaimed' ? 'text-text-hint' : 'text-text-positive'}>
          {gift.status}
        </HelpText>
      </div>
      {gift.status === 'Unclaimed' && <Icon name="ChevronForward" className="ml-2 h-4 w-4" />}
    </Plate>
  );
};
