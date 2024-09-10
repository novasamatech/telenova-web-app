import { type BN, BN_ZERO } from '@polkadot/util';

import { Price } from '../Price/Price';
import { Shimmering } from '../Shimmering/Shimmering';
import { BodyText } from '../Typography';

import { cnTw, toFormattedBalance } from '@/shared/helpers';
import { type Asset, type AssetPrices } from '@/types/substrate';

type Props = {
  balance?: BN;
  prices: AssetPrices | null;
  asset: Asset;
  showBalance?: boolean;
  className?: string;
};

export const TokenPrice = ({ balance = BN_ZERO, prices, asset, showBalance = true, className }: Props) => {
  const price = asset.priceId ? prices?.[asset.priceId] : { price: 0 };

  if (!price) {
    return <Shimmering width={100} height={20} />;
  }

  const { value, suffix } = toFormattedBalance(balance.muln(price.price), asset.precision, 3);

  const isGrow = price.change && price.change >= 0;
  const changeToShow = price.change && `${isGrow ? '+' : ''}${price.change.toFixed(2)}%`;

  return (
    <div className={cnTw('flex items-center justify-between', className)}>
      <BodyText className="text-text-hint" align="left">
        <Price amount={price.price} />
        <BodyText as="span" className={cnTw('ml-1', isGrow ? 'text-text-positive' : 'text-text-danger')}>
          {changeToShow}
        </BodyText>
      </BodyText>
      {showBalance && (
        <BodyText className="text-text-hint" align="right">
          <Price amount={value} />
          {suffix}
        </BodyText>
      )}
    </div>
  );
};
