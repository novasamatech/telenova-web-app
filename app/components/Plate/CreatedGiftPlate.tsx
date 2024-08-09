import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { useGifts } from '../../shared/hooks';
import { Icon } from '../Icon/Icon';
import { Plate } from '../Plate';
import { Shimmering } from '../Shimmering/Shimmering';
import { BigTitle, BodyText } from '../Typography';

import { type Gift } from '@/common/types';
import { networkModel, telegramModel } from '@/models';
import { getGifts } from '@/shared/helpers';

export const CreatedGiftPlate = () => {
  const { getGiftsState } = useGifts();

  const webApp = useUnit(telegramModel.$webApp);
  const connections = useUnit(networkModel.$connections);

  const [unclaimed, setUnclaimed] = useState<Gift[] | null>(null);

  useEffect(() => {
    if (!webApp) return;

    const localStorageGifts = getGifts(webApp);
    if (!localStorageGifts) return;

    getGiftsState(localStorageGifts).then(([unclaimed]) => setUnclaimed(unclaimed));
  }, [webApp, connections]);

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
