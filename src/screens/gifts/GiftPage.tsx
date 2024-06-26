import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { type Gift } from '@/common/types';
import { getGifts } from '@/common/utils/gift';
import { useGifts } from '@/common/utils/hooks/useGifts';
import { BodyText, GiftPlate, HelpText, Shimmering, TitleText } from '@/components';

export default function GiftPage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { hideMainButton } = useMainButton();

  const { getGiftsState } = useGifts();
  const [unclaimedGifts, setUnclaimedGifts] = useState<Gift[]>([]);
  const [claimedGifts, setClaimedGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BackButton?.show();
    hideMainButton();

    const callback = () => {
      navigate($path('/dashboard'));
    };
    BackButton?.onClick(callback);

    const mapGifts = getGifts();
    if (!mapGifts) {
      return;
    }

    getGiftsState(mapGifts).then(([unclaimed, claimed]) => {
      setUnclaimedGifts(unclaimed);
      setClaimedGifts(claimed);
      setLoading(false);
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
        Unclaimed <span className="text-text-on-button-disabled">{unclaimedGifts.length || 0}</span>
      </BodyText>
      {loading ? (
        <Shimmering width={350} height={92} />
      ) : unclaimedGifts.length ? (
        unclaimedGifts.map(gift => (
          <Link
            key={gift.timestamp}
            to={{
              pathname: $path('/gifts/details'),
              search: `?seed=${gift.secret}&symbol=${gift.chainAsset?.symbol}&balance=${gift.balance}`,
            }}
          >
            <GiftPlate gift={gift} isClaimed={false} />
          </Link>
        ))
      ) : (
        <div className="w-full bg-bg-input h-[92px] rounded-2xl flex justify-center items-center">
          <HelpText className="text-text-hint">All Gifts are claimed</HelpText>
        </div>
      )}

      <BodyText className="text-text-hint mb-2" align="left">
        Claimed <span className="text-text-on-button-disabled">{claimedGifts.length || 0}</span>
      </BodyText>
      {loading ? (
        <Shimmering width={350} height={92} />
      ) : claimedGifts.length ? (
        claimedGifts.map(gift => <GiftPlate gift={gift} key={gift.timestamp} isClaimed={true} />)
      ) : (
        <div className="w-full bg-bg-input h-[92px] rounded-2xl flex justify-center items-center">
          <HelpText className="text-text-hint">No claimed gifts</HelpText>
        </div>
      )}
    </>
  );
}
