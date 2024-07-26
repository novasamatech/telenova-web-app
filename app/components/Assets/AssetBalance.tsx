import { Icon } from '../Icon';
import { TokenPrice } from '../Price/TokenPrice';
import { MediumTitle } from '../Typography';

import { cnTw } from '@/common/utils/twMerge';
import { type Asset } from '@/types/substrate';

import { AssetIcon } from './AssetIcon';
import { Balance } from './Balance';

type Props = {
  asset: Asset;
  balance?: string;
  name?: string;
  className?: string;
  showPrice?: boolean;
  showArrow?: boolean;
  animate?: boolean;
};

export const AssetBalance = ({ balance, asset, className, showPrice, showArrow, animate }: Props) => {
  const { icon, precision, symbol, priceId } = asset;

  return (
    <div className={cnTw('grid grid-cols-[40px,1fr,auto] items-center gap-x-3 grid-rows-[1fr,auto]', className)}>
      <AssetIcon src={icon} size={40} className="row-span-2" />
      <MediumTitle>{symbol}</MediumTitle>
      <MediumTitle className="flex items-center justify-self-end">
        <Balance balance={balance} precision={precision} animate={animate} />
        {showArrow && <Icon name="ChevronForward" className="w-4 h-4 ml-2" />}
      </MediumTitle>
      {showPrice && <TokenPrice className="col-span-2" balance={balance} priceId={priceId} precision={precision} />}
    </div>
  );
};
