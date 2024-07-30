import { Link, useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { nonNullable } from '@/common/utils';
import { AssetBalance, TitleText } from '@/components';
import { balancesModel, networkModel } from '@/models';
import { type Asset } from '@/types/substrate';

export type SearchParams = {
  type: 'buy' | 'sell';
};

const ASSETS_TO_SKIP: Record<ChainId, AssetId> = {
  '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e': 0, // WND,
  '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f': 1, // Polkadot AH - USDT
};

export const clientLoader = (({ request }) => {
  const url = new URL(request.url);

  return { type: (url.searchParams.get('type') || 'buy') as SearchParams['type'] };
}) satisfies ClientLoaderFunction;

// type LoaderType = ReturnType<typeof clientLoader>>;

const Page = () => {
  const { type } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();

  const chains = useUnit(networkModel.$chains);
  const assets = useUnit(networkModel.$assets);
  const balances = useUnit(balancesModel.$balances);

  const exchangeAssets = Object.entries(assets)
    .map(([chainId, assetMap]) => {
      const typedChainId = chainId as ChainId;

      if (!assetMap) return null;
      if (!(typedChainId in ASSETS_TO_SKIP)) return [typedChainId, Object.values(assetMap)];

      const filteredAssets = Object.values(assetMap)
        .map(asset => (ASSETS_TO_SKIP[typedChainId] !== asset.assetId ? asset : null))
        .filter(nonNullable);

      return [typedChainId, filteredAssets];
    })
    .filter(nonNullable) as Array<[ChainId, Asset[]]>;

  return (
    <>
      <BackButton onClick={() => navigate($path('/exchange'))} />
      <TitleText className="mt-6 mb-10">Select a token {type ? `to ${type}` : ''}</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        {exchangeAssets.flatMap(([chainId, assets]) => {
          return assets.map(asset => (
            <Link
              key={asset.assetId}
              to={$path('/exchange/widget/:chainId/:assetId', { chainId, assetId: asset.assetId }, { type })}
            >
              <AssetBalance
                asset={asset}
                balance={balances[chainId][asset.assetId].balance.total}
                className="bg-white rounded-lg px-4 py-3 w-full hover:bg-bg-item-pressed active:bg-bg-item-pressed"
                name={chains[chainId].name}
                showArrow
              />
            </Link>
          ));
        })}
      </div>
    </>
  );
};

export default Page;
