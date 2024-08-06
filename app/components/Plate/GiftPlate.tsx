import { Icon } from '../Icon/Icon';
import { HelpText, MediumTitle } from '../Typography';

import { type Gift, GiftStatus } from '@/common/types';
import { cnTw } from '@/shared/helpers';

import { Plate } from './Plate';

type Props = {
  gift: Gift;
  isClaimed: boolean;
};

export const GiftPlate = ({ gift, isClaimed }: Props) => {
  const date = new Date(gift.timestamp).toLocaleString();

  return (
    <Plate className="mb-2 grid grid-cols-[40px,1fr,auto] items-center gap-x-3">
      <Icon name="Gift" className={cnTw(`w-10 h-10`, isClaimed ? 'text-bg-icon-accent-primary' : 'text-text-hint')} />
      <div>
        <MediumTitle>
          {gift.balance} {gift.chainAsset?.symbol}
        </MediumTitle>
        <HelpText as="p" className="text-text-hint">
          Created: {date}
        </HelpText>
        <HelpText as="p" className={gift.status === GiftStatus.UNCLAIMED ? 'text-text-hint' : 'text-text-positive'}>
          {gift.status}
        </HelpText>
      </div>
      {gift.status === GiftStatus.UNCLAIMED && <Icon name="ChevronForward" className="w-4 h-4 ml-2" />}
    </Plate>
  );
};
