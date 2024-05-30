import { MediumTitle, HelpText, Icon, Plate } from '@/components';
import { Gift, GiftStatus } from '@/common/types';

const GiftPlate = ({ gift, isClaimed }: { gift: Gift; isClaimed: boolean }) => {
  const date = new Date(gift.timestamp).toLocaleString();

  return (
    <Plate className="mb-2 grid grid-cols-[40px,1fr,auto] items-center gap-x-3">
      <Icon name="Gift" className={`w-10 h-10 ${isClaimed ? 'text-bg-icon-accent-primary' : 'text-text-hint'}`} />
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

export default GiftPlate;
