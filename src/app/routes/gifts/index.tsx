import { type FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useBackButton } from '@/common/telegram/useBackButton.ts';
import { useMainButton } from '@/common/telegram/useMainButton.ts';
import { type Gift } from '@/common/types';
import { getGifts } from '@/common/utils';
import { useGifts } from '@/common/utils/hooks';
import { BodyText, GiftPlate, HelpText, Shimmering, TitleText } from '@/components';

const Page: FC = () => {
  const navigate = useNavigate();
  const { addBackButton } = useBackButton();
  const { hideMainButton } = useMainButton();

  const { getGiftsState } = useGifts();
  const [unclaimedGifts, setUnclaimedGifts] = useState<Gift[]>([]);
  const [claimedGifts, setClaimedGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hideMainButton();
    addBackButton(() => {
      navigate($path('/dashboard'));
    });

    const mapGifts = getGifts();
    if (!mapGifts) {
      return;
    }

    (async function () {
      await getGiftsState(mapGifts).then(([unclaimed, claimed]) => {
        setUnclaimedGifts(unclaimed);
        setClaimedGifts(claimed);
        setLoading(false);
      });
    })();
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
            to={{
              pathname: $path('/gifts/details'),
              search: `?seed=${gift.secret}&symbol=${gift.chainAsset?.symbol}&balance=${gift.balance}`,
            }}
            key={gift.timestamp}
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
};

export default Page;
