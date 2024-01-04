'use client';
import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useTelegram } from '@common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { BodyText, GiftPlate, Layout, TitleText } from '@/components';
import { useBalances } from '@/common/balances/BalanceProvider';
import { getGifts } from '@/common/utils/gift';
import { Gift } from '@/common/types';

// TODO add loading state for unclaimed and claimed
export default function GiftPage() {
  const router = useRouter();
  const { BackButton, MainButton } = useTelegram();
  const { getGiftsBalance } = useBalances();
  const [unclaimedGifts, setUnclaimedGifts] = useState<Gift[]>([]);
  const [claimedGifts, setClaimedGifts] = useState<Gift[]>([]);

  useEffect(() => {
    BackButton?.show();
    MainButton?.hide();

    const callback = async () => {
      router.push(Paths.DASHBOARD);
    };
    BackButton?.onClick(callback);

    const mapGifts = getGifts();
    if (!mapGifts) return;

    for (const [key, value] of mapGifts) {
      (async function () {
        const [unclaimed, claimed] = await getGiftsBalance(value, key);
        setUnclaimedGifts((prev) => [...prev, ...unclaimed]);
        setClaimedGifts((prev) => [...prev, ...claimed]);
      })();
    }

    return () => {
      BackButton?.hide();
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <div className="min-h-screen p-4">
      <TitleText className="mb-4" align="left">
        Gifts
      </TitleText>
      {!!unclaimedGifts.length && (
        <>
          <BodyText className="text-text-hint mb-2" align="left">
            Unclaimed
          </BodyText>
          {unclaimedGifts.map((gift) => (
            <GiftPlate gift={gift} key={gift.timestamp} />
          ))}
        </>
      )}
      {!!claimedGifts.length && (
        <>
          <BodyText className="text-text-hint mb-2" align="left">
            Claimed
          </BodyText>
          {claimedGifts.map((gift) => (
            <GiftPlate gift={gift} key={gift.timestamp} />
          ))}
        </>
      )}
    </div>
  );
}

GiftPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
