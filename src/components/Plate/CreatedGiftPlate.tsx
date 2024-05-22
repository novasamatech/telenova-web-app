import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Paths } from '@/common/routing';
import { BodyText, Icon, Plate, BigTitle } from '@/components';
import { GIFT_STORE } from '@/common/utils/constants';
import { getStoreName } from '@/common/wallet';
import { getGifts } from '@/common/utils/gift';
import { useGifts } from '@/common/utils/hooks/useGifts';
import { Gift } from '@/common/types';

const CreatedGiftPlate = () => {
  const { getGiftsState } = useGifts();
  const gifts = JSON.parse(localStorage.getItem(getStoreName(GIFT_STORE)) as string);
  const [unclaimed, setUnclaimed] = useState<Gift[]>([]);

  useEffect(() => {
    if (!gifts) return;
    const mapGifts = getGifts();
    (async () => {
      const [unclaimed] = await getGiftsState(mapGifts!);
      setUnclaimed(unclaimed);
    })();
  }, []);

  if (!gifts) return;

  return (
    <Plate className="w-full h-[90px] rounded-3xl mt-4 active:bg-bg-item-pressed">
      <Link to={Paths.GIFTS} className="w-full grid grid-cols-[auto,1fr,auto] items-center gap-4">
        <Icon name="Present" size={60} />
        <div className="grid">
          <BigTitle align="left">Created Gifts</BigTitle>
          <BodyText align="left" className="text-text-hint">
            {unclaimed.length ? `Unclamed: ${unclaimed.length}` : 'All your gifts were claimed'}
          </BodyText>
        </div>
        <Icon name="ArrowBold" className="w-10 h-10 self-center" />
      </Link>
    </Plate>
  );
};

export default CreatedGiftPlate;
