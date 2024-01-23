'use client';
import { ReactElement, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useTelegram } from '@common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { BodyText, GiftPlate, Layout, Shimmering, TitleText } from '@/components';
import { useBalances } from '@/common/balances/BalanceProvider';
import { getGifts } from '@/common/utils/gift';
import { Gift } from '@/common/types';

// TODO improve loading state for unclaimed and claimed
export default function GiftPage() {
  const navigate = useNavigate();

  const { BackButton, MainButton } = useTelegram();
  const { getGiftsState } = useBalances();
  const [unclaimedGifts, setUnclaimedGifts] = useState<Gift[]>([]);
  const [claimedGifts, setClaimedGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BackButton?.show();
    MainButton?.hide();

    const callback = async () => {
      navigate(Paths.DASHBOARD);
    };
    BackButton?.onClick(callback);

    const mapGifts = getGifts();
    if (!mapGifts) return;

    mapGifts.forEach((value, key) => {
      (async function () {
        const [unclaimed, claimed] = await getGiftsState(value, key);
        setUnclaimedGifts((prev) => [...prev, ...unclaimed]);
        setClaimedGifts((prev) => [...prev, ...claimed]);
        setLoading(false);
      })();
    });

    return () => {
      BackButton?.hide();
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <>
      <TitleText className="mb-4" align="left">
        Gifts
      </TitleText>
      <BodyText className="text-text-hint mb-2" align="left">
        Unclaimed
      </BodyText>
      {loading && <Shimmering width={200} height={20} />}
      {!!unclaimedGifts.length &&
        unclaimedGifts.map((gift) => (
          <Link
            to={{ pathname: `${Paths.GIFT_DETAILS}`, search: `?seed=${gift.secret}&symbol=${gift.chainAsset?.symbol}` }}
            key={gift.timestamp}
          >
            <GiftPlate gift={gift} />
          </Link>
        ))}
      <BodyText className="text-text-hint mb-2" align="left">
        Claimed
      </BodyText>
      {loading && <Shimmering width={200} height={20} />}
      {!!claimedGifts.length && claimedGifts.map((gift) => <GiftPlate gift={gift} key={gift.timestamp} />)}
    </>
  );
}

GiftPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
