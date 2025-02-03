import { Link, useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { giftsModel } from '@/models/gifts';
import { BackButton } from '@/shared/api';
import { toFormattedBalance } from '@/shared/helpers';
import { BodyText, HelpText, Shimmering, TitleText } from '@/ui/atoms';
import { GiftPlate } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();

  const [unclaimedGifts, claimedGifts, isLoading] = useUnit([
    giftsModel.$unclaimedGifts,
    giftsModel.$claimedGifts,
    giftsModel.$isLoading,
  ]);

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
            <div className="flex h-[92px] w-full items-center justify-center rounded-lg bg-bg-input">
              <HelpText className="text-text-hint">All Gifts are claimed</HelpText>
            </div>
          )}

          {!isLoading &&
            unclaimedGifts.length > 0 &&
            unclaimedGifts.map(gift => {
              // Old gifts have formatted balance
              const formattedBalance =
                gift.chainIndex === undefined
                  ? gift.balance
                  : toFormattedBalance(gift.balance, gift.asset.precision).formatted;

              return (
                <Link
                  key={gift.timestamp}
                  to={$path('/gifts/details', {
                    seed: gift.secret,
                    chainIndex: gift.chainIndex?.toString() || '',
                    symbol: gift.asset.symbol,
                    balance: formattedBalance,
                  })}
                >
                  <GiftPlate gift={gift} isClaimed={false} />
                </Link>
              );
            })}
        </div>

        <div className="flex flex-col gap-y-2">
          <BodyText className="mb-2 text-text-hint" align="left">
            Claimed <span className="text-text-on-button-disabled">{claimedGifts.length || 0}</span>
          </BodyText>
          {isLoading && <Shimmering height={92} className="rounded-lg" />}

          {!isLoading && claimedGifts.length === 0 && (
            <div className="flex h-[92px] w-full items-center justify-center rounded-2xl bg-bg-input">
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
