import { Link, useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { balancesModel, networkModel } from '@/models';
import { KUSAMA, POLKADOT } from '@/shared/helpers/chains';
import { TitleText } from '@/ui/atoms';
import { AssetBalance } from '@/ui/molecules';

export type SearchParams = {
  type: 'buy' | 'sell';
};

// Mercuryo supported cryptocurrencies:
// https://help.mercuryo.io/hc/en-gb/articles/14495549158045-Which-cryptocurrencies-are-supported
const SUPPORTED_ASSETS: Record<ChainId, AssetId> = {
  [POLKADOT]: 0, // DOT
  [KUSAMA]: 0, // KSM
};

export const clientLoader = (({ request }) => {
  const url = new URL(request.url);

  return { type: (url.searchParams.get('type') || 'buy') as SearchParams['type'] };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { type } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();

  const chains = useUnit(networkModel.$chains);
  const assets = useUnit(networkModel.$sortedAssets);
  const balances = useUnit(balancesModel.$balances);

  const exchangeAssets = assets.filter(([chainId, asset]) => SUPPORTED_ASSETS[chainId] === asset.assetId);

  return (
    <>
      <BackButton onClick={() => navigate($path('/exchange'))} />
      <TitleText className="mb-10 mt-6">Select a token {type ? `to ${type}` : ''}</TitleText>
      <div className="mt-4 flex flex-col gap-2">
        {exchangeAssets.map(([chainId, asset]) => (
          <Link
            key={`${chainId}_${asset.assetId}`}
            to={$path('/exchange/widget/:chainId/:assetId', { chainId, assetId: asset.assetId }, { type })}
          >
            <AssetBalance
              asset={asset}
              balance={balances[chainId]?.[asset.assetId]?.balance.total}
              className="w-full rounded-lg bg-white px-4 py-3 hover:bg-bg-item-pressed active:bg-bg-item-pressed"
              name={chains[chainId].name}
              showArrow
            />
          </Link>
        ))}
      </div>
    </>
  );
};

export default Page;
