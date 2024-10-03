import { Link } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { giftsModel } from '@/models/gifts';
import { BigTitle, BodyText, Icon, Plate, Shimmering } from '@/ui/atoms';

export const CreatedGiftPlate = () => {
  const [unclaimedGifts, isPending] = useUnit([giftsModel.$unclaimedGifts, giftsModel.$isPending]);

  return (
    <Plate className="mt-4 h-[90px] w-full rounded-3xl border-1 border-border-neutral active:bg-bg-item-pressed">
      <Link to={$path('/gifts')} className="grid w-full grid-cols-[auto,1fr,auto] items-center gap-4">
        <Icon name="Present" size={60} />
        <div className="grid">
          <BigTitle align="left">Created Gifts</BigTitle>
          {isPending && <Shimmering width={100} height={20} />}
          {!isPending && unclaimedGifts.length > 0 && (
            <BodyText align="left" className="text-text-hint">
              Unclaimed: {unclaimedGifts.length}
            </BodyText>
          )}
          {!isPending && unclaimedGifts.length === 0 && (
            <BodyText align="left" className="text-text-hint">
              All your gifts were claimed
            </BodyText>
          )}
        </div>
        <Icon name="ArrowBold" className="h-10 w-10 self-center" />
      </Link>
    </Plate>
  );
};
