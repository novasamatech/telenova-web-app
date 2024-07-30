import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { type Gift } from '@/common/types';
import { GIFT_STORE, getGifts } from '@/common/utils';
import { useGifts } from '@/common/utils/hooks';
import { getStoreName } from '@/common/wallet';
import { BigTitle, BodyText, Icon, Plate, Shimmering } from '@/components';
import { networkModel } from '@/models';

const CreatedGiftPlate = () => {
  const { getGiftsState } = useGifts();

  const connections = useUnit(networkModel.$connections);

  const [unclaimed, setUnclaimed] = useState<Gift[] | null>(null);

  const gifts = JSON.parse(localStorage.getItem(getStoreName(GIFT_STORE)) as string);

  useEffect(() => {
    if (!gifts) return;

    const localStorageGifts = getGifts();
    getGiftsState(localStorageGifts!).then(([unclaimed]) => setUnclaimed(unclaimed));
  }, [connections]);

  if (!gifts) return null;

  return (
    <Plate className="w-full h-[90px] rounded-3xl mt-4 active:bg-bg-item-pressed">
      <Link to={$path('/gifts')} className="w-full grid grid-cols-[auto,1fr,auto] items-center gap-4">
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
        <Icon name="ArrowBold" className="w-10 h-10 self-center" />
      </Link>
    </Plate>
  );
};

export default CreatedGiftPlate;
