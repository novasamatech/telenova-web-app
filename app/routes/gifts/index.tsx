import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { BodyText, GiftPlate, HelpText, Shimmering, TitleText } from '@/components';
import { telegramModel } from '@/models';
import { getGifts } from '@/shared/helpers';
import { useGifts } from '@/shared/hooks';
import { type Gift } from '@/types/substrate';

const Page = () => {
  const navigate = useNavigate();
  const { getGiftsState } = useGifts();

  const webApp = useUnit(telegramModel.$webApp);

  const [isLoading, setIsLoading] = useState(true);
  const [claimedGifts, setClaimedGifts] = useState<Gift[]>([]);
  const [unclaimedGifts, setUnclaimedGifts] = useState<Gift[]>([]);

  useEffect(() => {
    if (!webApp) return;

    const mapGifts = getGifts(webApp);
    if (!mapGifts) return;

    getGiftsState(mapGifts).then(([unclaimed, claimed]) => {
      setUnclaimedGifts(unclaimed);
      setClaimedGifts(claimed);
      setIsLoading(false);
    });
  }, [webApp]);

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
          {isLoading && <Shimmering height={92} className="rounded-lg" />}

          {!isLoading && unclaimedGifts.length === 0 && (
            <div className="w-full bg-bg-input h-[92px] rounded-lg flex justify-center items-center">
              <HelpText className="text-text-hint">All Gifts are claimed</HelpText>
            </div>
          )}

          {!isLoading &&
            unclaimedGifts.length > 0 &&
            unclaimedGifts.map(gift => (
              <Link
                key={gift.timestamp}
                to={$path('/gifts/details', {
                  seed: gift.secret,
                  chainIndex: gift.chainIndex?.toString() || '',
                  symbol: gift.chainAsset?.symbol ?? '',
                  balance: gift.balance,
                })}
              >
                <GiftPlate gift={gift} isClaimed={false} />
              </Link>
            ))}
        </div>

        <div className="flex flex-col gap-y-2">
          <BodyText className="text-text-hint mb-2" align="left">
            Claimed <span className="text-text-on-button-disabled">{claimedGifts.length || 0}</span>
          </BodyText>
          {isLoading && <Shimmering height={92} className="rounded-lg" />}

          {!isLoading && claimedGifts.length === 0 && (
            <div className="w-full bg-bg-input h-[92px] rounded-2xl flex justify-center items-center">
              <HelpText className="text-text-hint">No claimed gifts</HelpText>
            </div>
          )}

          {!isLoading &&
            claimedGifts.length > 0 &&
            claimedGifts.map(gift => <GiftPlate gift={gift} key={gift.timestamp} isClaimed />)}
        </div>
      </div>
    </>
  );
};

export default Page;
