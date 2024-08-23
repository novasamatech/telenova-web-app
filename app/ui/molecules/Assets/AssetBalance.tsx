import { type BN } from '@polkadot/util';

import { TotalBalance } from '../TotalBalance/TotalBalance';

import { cnTw } from '@/shared/helpers/twMerge';
import { type Asset, type AssetPrices } from '@/types/substrate';
import { AssetIcon, Icon, MediumTitle, TokenPrice } from '@/ui/atoms';

type Props = {
  asset: Asset;
  balance?: BN;
  prices: AssetPrices | null;
  name?: string;
  showPrice?: boolean;
  showArrow?: boolean;
  className?: string;
  animate?: boolean;
};

export const AssetBalance = ({ balance, prices, asset, className, showPrice, showArrow, animate }: Props) => {
  return (
    <div className={cnTw('grid grid-cols-[48px,1fr,auto] grid-rows-[1fr,auto] items-center gap-x-3', className)}>
      <AssetIcon src={asset.icon} size={48} className="row-span-2" />
      <MediumTitle>{asset.symbol}</MediumTitle>
      <MediumTitle className="flex items-center justify-self-end">
        <TotalBalance balance={balance} precision={asset.precision} animate={animate} />
        {showArrow && <Icon name="ChevronForward" size={16} className="ml-2" />}
      </MediumTitle>
      {showPrice && <TokenPrice className="col-span-2" balance={balance} prices={prices} asset={asset} />}
    </div>
  );
};
