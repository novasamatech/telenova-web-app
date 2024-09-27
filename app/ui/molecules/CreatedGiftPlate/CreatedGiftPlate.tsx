import { Link } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { giftsModel } from '@/models/gifts';
import { BigTitle, BodyText, Icon, Plate, Shimmering } from '@/ui/atoms';

export const CreatedGiftPlate = () => {
  const unclaimedGifts = useUnit(giftsModel.$unclaimedGifts);

  return (
    <Plate className="mt-4 h-[90px] w-full rounded-3xl border-1 border-border-neutral active:bg-bg-item-pressed">
      <Link to={$path('/gifts')} className="grid w-full grid-cols-[auto,1fr,auto] items-center gap-4">
        <Icon name="Present" size={60} />
        <div className="grid">
          <BigTitle align="left">Created Gifts</BigTitle>
          {unclaimedGifts ? (
            <BodyText align="left" className="text-text-hint">
              {unclaimedGifts.length > 0 ? `Unclaimed: ${unclaimedGifts.length}` : 'All your gifts were claimed'}
            </BodyText>
          ) : (
            <Shimmering width={100} height={20} />
          )}
        </div>
        <Icon name="ArrowBold" className="h-10 w-10 self-center" />
      </Link>
    </Plate>
  );
};
