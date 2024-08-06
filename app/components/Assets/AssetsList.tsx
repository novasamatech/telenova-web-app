import { type ComponentProps } from 'react';

import { cnTw } from '@/shared/helpers';
import { type Asset, type ChainBalances, type ChainsMap } from '@/types/substrate';

import { AssetBalance as AssetBalanceItem } from './AssetBalance';

type Props = Pick<ComponentProps<typeof AssetBalanceItem>, 'animate' | 'showArrow' | 'showPrice' | 'className'> & {
  chains: ChainsMap;
  assets: [ChainId, Asset][];
  balances: ChainBalances;
  onClick?: (chainId: ChainId, assetId: AssetId) => void;
};

export const AssetsList = ({ chains, assets, className, balances, onClick, ...props }: Props) => {
  return assets.map(([chainId, asset]) => {
    const assetBalance = balances[chainId]?.[asset.assetId];

    if (onClick) {
      return (
        <button
          key={`${chainId}_${asset.assetId}`}
          className={cnTw('appearance-none', className)}
          onClick={() => onClick(chainId, asset.assetId)}
        >
          <AssetBalanceItem
            asset={asset}
            balance={assetBalance?.balance.total}
            name={chains[chainId].name}
            {...props}
          />
        </button>
      );
    }

    return (
      <AssetBalanceItem
        key={`${chainId}_${asset.assetId}`}
        className={className}
        asset={asset}
        balance={assetBalance?.balance.total}
        name={chains[chainId].name}
        {...props}
      />
    );
  });
};
