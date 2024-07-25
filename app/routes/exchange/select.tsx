import { Link, useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $path } from 'remix-routes';

import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { AssetBalance, TitleText } from '@/components';

// Query params for /exchange/select?type=__value__
export type SearchParams = {
  type: 'buy' | 'sell';
};

const skippedBuyAssets = ['WND', 'USDT'];

export const clientLoader = (({ request }) => {
  const url = new URL(request.url);

  return { type: (url.searchParams.get('type') || 'buy') as SearchParams['type'] };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { type } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();
  const { assets } = useGlobalContext();

  const exchangeAssets = assets.filter(i => !skippedBuyAssets.includes(i.asset.symbol));

  return (
    <>
      <BackButton onClick={() => navigate($path('/exchange'))} />
      <TitleText className="mt-6 mb-10">Select a token {type ? `to ${type}` : ''}</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        {exchangeAssets.map(asset => (
          <Link
            key={asset.chainId}
            to={$path(
              '/exchange/widget/:chainId/:assetId',
              { chainId: asset.chainId, assetId: asset.asset.assetId },
              { type },
            )}
          >
            <AssetBalance
              asset={asset.asset}
              balance={asset.totalBalance}
              className="bg-white rounded-lg px-4 py-3 w-full hover:bg-bg-item-pressed active:bg-bg-item-pressed"
              name={asset.chainName}
              showArrow
            />
          </Link>
        ))}
      </div>
    </>
  );
};

export default Page;
