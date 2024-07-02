import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { type Gift } from '@/common/types';
import { getGifts } from '@/common/utils';
import { useGifts } from '@/common/utils/hooks';
import { BodyText, GiftPlate, HelpText, Shimmering, TitleText } from '@/components';

const Page = () => {
  const navigate = useNavigate();
  const { getGiftsState } = useGifts();

  const [loading, setLoading] = useState(true);
  const [claimedGifts, setClaimedGifts] = useState<Gift[]>([]);
  const [unclaimedGifts, setUnclaimedGifts] = useState<Gift[]>([]);

  useEffect(() => {
    const mapGifts = getGifts();
    if (!mapGifts) return;

    getGiftsState(mapGifts).then(([unclaimed, claimed]) => {
      setUnclaimedGifts(unclaimed);
      setClaimedGifts(claimed);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <BackButton onClick={() => navigate($path('/dashboard'))} />
      <TitleText className="mb-4" align="left">
        Gifts
      </TitleText>

      <div className="flex flex-col gap-y-3">
        <div className="flex flex-col gap-y-2">
          <BodyText className="text-text-hint" align="left">
            Unclaimed <span className="text-text-on-button-disabled">{unclaimedGifts.length || 0}</span>
          </BodyText>
          {loading ? (
            <Shimmering width={350} height={92} />
          ) : unclaimedGifts.length ? (
            unclaimedGifts.map(gift => (
              <Link
                key={gift.timestamp}
                to={$path('/gifts/details', {
                  seed: gift.secret,
                  symbol: gift.chainAsset?.symbol ?? '',
                  balance: gift.balance,
                })}
              >
                <GiftPlate gift={gift} isClaimed={false} />
              </Link>
            ))
          ) : (
            <div className="w-full bg-bg-input h-[92px] rounded-2xl flex justify-center items-center">
              <HelpText className="text-text-hint">All Gifts are claimed</HelpText>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-y-2">
          <BodyText className="text-text-hint mb-2" align="left">
            Claimed <span className="text-text-on-button-disabled">{claimedGifts.length || 0}</span>
          </BodyText>
          {loading ? (
            <Shimmering width={350} height={92} />
          ) : claimedGifts.length ? (
            claimedGifts.map(gift => <GiftPlate gift={gift} key={gift.timestamp} isClaimed />)
          ) : (
            <div className="w-full bg-bg-input h-[92px] rounded-2xl flex justify-center items-center">
              <HelpText className="text-text-hint">No claimed gifts</HelpText>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
