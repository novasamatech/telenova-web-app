import { type FC } from 'react';

import { type IconNames } from '../Icon/types';

import { type Asset } from '@/common/chainRegistry/types';
import { cnTw } from '@/common/utils/twMerge';
import { Icon, MediumTitle, TokenPrice } from '@/components';

import Balance from './Balance';

type Props = {
  asset: Asset;
  balance?: string;
  name?: string;
  className?: string;
  showPrice?: boolean;
  showArrow?: boolean;
  animate?: boolean;
};

const AssetBalance: FC<Props> = ({ balance, asset, name, className, showPrice, showArrow, animate }) => {
  const { precision, symbol, priceId } = asset;

  return (
    <div className={cnTw('grid grid-cols-[40px,1fr,auto] items-center gap-x-3 grid-rows-[1fr,auto]', className)}>
      <Icon name={symbol as IconNames} size={40} alt={name} className="row-span-2" />
      <MediumTitle>{symbol}</MediumTitle>
      <MediumTitle className="flex items-center justify-self-end">
        <Balance balance={balance} precision={precision} animate={animate} />
        {showArrow && <Icon name="ChevronForward" className="w-4 h-4 ml-2" />}
      </MediumTitle>
      {showPrice && <TokenPrice priceId={priceId} precision={precision} />}
    </div>
  );
};

export default AssetBalance;
