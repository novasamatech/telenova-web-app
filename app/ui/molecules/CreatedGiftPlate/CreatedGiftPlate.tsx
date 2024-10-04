import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { networkModel } from '@/models/network';
import { getGifts } from '@/shared/helpers';
import { useGifts } from '@/shared/hooks';
import { type Gift } from '@/types/substrate';
import { BigTitle, BodyText, Icon, Plate, Shimmering } from '@/ui/atoms';

export const CreatedGiftPlate = () => {
  const { getGiftsState } = useGifts();

  const connections = useUnit(networkModel.$connections);

  const [unclaimed, setUnclaimed] = useState<Gift[] | null>(null);

  useEffect(() => {
    const localStorageGifts = getGifts();
    if (localStorageGifts) {
      getGiftsState(localStorageGifts).then(([unclaimed]) => setUnclaimed(unclaimed));
    } else {
      setUnclaimed([]);
    }
  }, [connections]);

  return (
    <Plate className="mt-4 h-[90px] w-full rounded-3xl border-1 border-border-neutral active:bg-bg-item-pressed">
      <Link to={$path('/gifts')} className="grid w-full grid-cols-[auto,1fr,auto] items-center gap-4">
        <Icon name="Present" size={60} />
        <div className="grid">
          <BigTitle align="left">Created Gifts</BigTitle>
          {unclaimed ? (
            <BodyText align="left" className="text-text-hint">
              {unclaimed.length ? `Unclaimed: ${unclaimed.length}` : 'All your gifts were claimed'}
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
