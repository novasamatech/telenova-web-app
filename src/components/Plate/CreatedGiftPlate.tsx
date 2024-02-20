import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Paths } from '@/common/routing';
import { BodyText, Icon, Plate, TitleText } from '@/components';
import { GIFT_STORE } from '@/common/utils/constants';
import { getStoreName } from '@/common/wallet';
import { getGifts } from '@/common/utils/gift';
import { useBalances } from '@/common/balances/BalanceProvider';
import { Gift } from '@/common/types';

const CreatedGiftPlate = () => {
  const { getGiftsState } = useBalances();
  const gifts = JSON.parse(localStorage.getItem(getStoreName(GIFT_STORE)) as string);
  const [unclaimed, setUnclaimed] = useState<Gift[]>([]);

  useEffect(() => {
    if (!gifts) return;
    const mapGifts = getGifts();
    (async () => {
      const [unclaimed] = await getGiftsState(mapGifts!);
      setUnclaimed(unclaimed);
    })();
  }, [gifts]);

  if (!gifts) return;

  return (
    <Plate className="w-full h-[90px] rounded-3xl mt-4 active:bg-bg-item-pressed">
      <Link to={Paths.GIFTS} className="w-full grid grid-cols-[auto,1fr,auto] items-center gap-4">
        <Icon name="Present" className="w-[60px] h-[60px]" />
        <div className="grid">
          <TitleText align="left">Created Gifts</TitleText>
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
