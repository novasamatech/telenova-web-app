import { cnTw } from '@/common/utils/twMerge';

import { CaptionText, Icon } from '@/components';
import { PriceItem } from '@/common/types';
import { IconNames } from '../Icon/types';
import TokenPrice from '../Price/TokenPrice';
import { Asset } from '@/common/chainRegistry/types';
import Balance from './Balance';

type Props = {
  asset: Asset;
  balance?: string;
  price?: PriceItem;
  name?: string;
  className?: string;
  showPrice?: boolean;
  showArrow?: boolean;
};

const AssetBalance = ({ balance, asset, name, className, showPrice, showArrow }: Props) => {
  const { precision, symbol, priceId } = asset;

  return (
    <div className={cnTw('grid grid-cols-[50px,1fr,auto] items-center gap-x-2 grid-rows-[1fr,auto]', className)}>
      <Icon name={symbol as IconNames} size={40} alt={name} className="row-span-2" />
      <CaptionText>{symbol}</CaptionText>
      <CaptionText className="flex items-center">
        <Balance balance={balance} precision={precision} />
        {showArrow && <Icon name="chevronForward" className="w-4 h-4 ml-2" />}
      </CaptionText>
      {showPrice && <TokenPrice priceId={priceId} balance={balance} precision={precision} />}
    </div>
  );
};

export default AssetBalance;
