import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { Icon } from '../Icon/Icon';
import { Plate } from '../Plate';
import { Shimmering } from '../Shimmering/Shimmering';
import { BigTitle, BodyText } from '../Typography';

import { networkModel, telegramModel } from '@/models';
import { getGifts } from '@/shared/helpers';
import { useGifts } from '@/shared/hooks';
import { type Gift } from '@/types/substrate';

export const CreatedGiftPlate = () => {
  const { getGiftsState } = useGifts();

  const webApp = useUnit(telegramModel.$webApp);
  const connections = useUnit(networkModel.$connections);

  const [unclaimed, setUnclaimed] = useState<Gift[] | null>(null);

  useEffect(() => {
    if (!webApp) return;

    const localStorageGifts = getGifts(webApp);
    if (localStorageGifts) {
      getGiftsState(localStorageGifts).then(([unclaimed]) => setUnclaimed(unclaimed));
    } else {
      setUnclaimed([]);
    }
  }, [webApp, connections]);

  return (
    <Plate className="mt-4 h-[90px] w-full rounded-3xl active:bg-bg-item-pressed">
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
