import { Link, useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { AssetBalance, TitleText } from '@/components';
import { balancesModel, networkModel } from '@/models';
import { KUSAMA, POLKADOT } from '@/shared/helpers/chains.ts';

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
      <TitleText className="mt-6 mb-10">Select a token {type ? `to ${type}` : ''}</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        {exchangeAssets.map(([chainId, asset]) => (
          <Link
            key={`${chainId}_${asset.assetId}`}
            to={$path('/exchange/widget/:chainId/:assetId', { chainId, assetId: asset.assetId }, { type })}
          >
            <AssetBalance
              asset={asset}
              balance={balances[chainId]?.[asset.assetId]?.balance.total}
              className="bg-white rounded-lg px-4 py-3 w-full hover:bg-bg-item-pressed active:bg-bg-item-pressed"
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
