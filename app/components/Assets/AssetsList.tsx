import { type ComponentProps } from 'react';

import { type AssetAccount } from '@/common/types';
import { cnTw } from '@/common/utils';

import AssetBalance from './AssetBalance';

type Props = Pick<ComponentProps<typeof AssetBalance>, 'animate' | 'showArrow' | 'showPrice' | 'className'> & {
  assets: AssetAccount[];
  onClick?: (asset: AssetAccount) => unknown;
};

const AssetsList = ({ assets, className, onClick, ...props }: Props) => {
  return assets.map(asset => {
    if (onClick) {
      return (
        <button key={asset.chainId} className={cnTw('appearance-none', className)} onClick={() => onClick(asset)}>
          <AssetBalance asset={asset.asset} balance={asset.totalBalance} name={asset.chainName} {...props} />
        </button>
      );
    }

    return (
      <AssetBalance
        key={asset.chainId}
        className={className}
        asset={asset.asset}
        balance={asset.totalBalance}
        name={asset.chainName}
        {...props}
      />
    );
  });
};

export default AssetsList;
