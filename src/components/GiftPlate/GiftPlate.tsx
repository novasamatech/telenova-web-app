import { CaptionText, HelpText, Icon, Plate } from '@/components';
import { Gift, GiftStatus } from '@/common/types';

const GiftPlate = ({ gift }: { gift: Gift }) => {
  const date = new Date(gift.timestamp).toLocaleString();

  return (
    <Plate className="mb-2 grid grid-cols-[40px,1fr,auto] items-center gap-x-4">
      <Icon name="gift" className="w-10 h-10" />
      <div>
        <CaptionText>
          {gift.balance} {gift.chainAsset?.symbol}
        </CaptionText>
        <HelpText as="p" className="text-text-hint">
          Created: {date}
        </HelpText>
        <HelpText as="p" className={gift.status === GiftStatus.UNCLAIMED ? 'text-text-hint' : 'text-text-positive'}>
          {gift.status}
        </HelpText>
      </div>
      {gift.status === GiftStatus.UNCLAIMED && <Icon name="chevronForward" className="w-4 h-4 ml-2" />}
    </Plate>
  );
};

export default GiftPlate;
