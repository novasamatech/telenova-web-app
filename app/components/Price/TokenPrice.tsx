import { type BN } from '@polkadot/util';

import { Price } from '../Price/Price';
import { Shimmering } from '../Shimmering/Shimmering';
import { BodyText } from '../Typography';

import { useGlobalContext } from '@/common/providers/contextProvider';
import { cnTw } from '@/shared/helpers';
import { toFormattedBalance } from '@/shared/helpers/balance';
import { type Asset } from '@/types/substrate';

type Props = {
  balance?: BN;
  asset: Asset;
  showBalance?: boolean;
  className?: string;
};

export const TokenPrice = ({ balance, asset, showBalance = true, className }: Props) => {
  const { assetsPrices } = useGlobalContext();

  const price = asset.priceId ? assetsPrices?.[asset.priceId] : { price: 0 };

  if (!price) {
    return <Shimmering width={100} height={20} />;
  }

  const { value, suffix } = toFormattedBalance(balance, asset.precision);

  const isGrow = price.change && price.change >= 0;
  const changeToShow = price.change && `${isGrow ? '+' : ''}${price.change.toFixed(2)}%`;

  return (
    <div className={cnTw('flex items-center justify-between', className)}>
      <BodyText className="text-text-hint" align="left">
        <Price amount={price.price} />
        {price.change && (
          <BodyText as="span" className={cnTw('ml-1', isGrow ? 'text-text-positive' : 'text-text-danger')}>
            {changeToShow}
          </BodyText>
        )}
      </BodyText>
      {showBalance && (
        <BodyText className="text-text-hint" align="right">
          <Price amount={Number(value) * price.price} />
          {suffix}
        </BodyText>
      )}
    </div>
  );
};
