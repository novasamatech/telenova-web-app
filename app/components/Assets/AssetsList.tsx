import { type ComponentProps } from 'react';

import { cnTw } from '@/common/utils';
import { type AssetBalance, type AssetsMap, type ChainBalances, type ChainsMap } from '@/types/substrate';

import { default as AssetBalanceItem } from './AssetBalance';

type Props = Pick<ComponentProps<typeof AssetBalanceItem>, 'animate' | 'showArrow' | 'showPrice' | 'className'> & {
  chains: ChainsMap;
  assets: AssetsMap;
  balances: ChainBalances;
  onClick?: (asset: AssetBalance) => void;
};

const AssetsList = ({ chains, assets, className, balances, onClick, ...props }: Props) => {
  return Object.entries(assets).map(([chainId, assetsMap]) => {
    const typedChainId = chainId as ChainId;

    if (!assetsMap) return null;

    return Object.entries(assetsMap).map(([assetId, asset]) => {
      const assetBalance = balances[typedChainId]?.[Number(assetId) as AssetId];

      if (onClick) {
        return (
          <button key={assetId} className={cnTw('appearance-none', className)} onClick={() => onClick(assetBalance)}>
            <AssetBalanceItem
              asset={asset}
              balance={assetBalance?.balance.total}
              name={chains[typedChainId].name}
              {...props}
            />
          </button>
        );
      }

      return (
        <AssetBalanceItem
          key={asset.assetId}
          className={className}
          asset={asset}
          balance={assetBalance?.balance.total}
          name={chains[typedChainId].name}
          {...props}
        />
      );
    });
  });
};

export default AssetsList;
