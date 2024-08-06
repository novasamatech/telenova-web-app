import { BN } from '@polkadot/util';

import { cnTw } from '../../shared/helpers';
import { Price } from '../Price/Price';
import { Shimmering } from '../Shimmering/Shimmering';
import { BodyText } from '../Typography';

import { useGlobalContext } from '@/common/providers/contextProvider';
import { toFormattedBalance } from '@/shared/helpers/balance';

type Props = {
  balance?: BN;
  priceId?: string;
  precision?: number;
  showBalance?: boolean;
  className?: string;
};

export const TokenPrice = ({ balance, priceId, precision, showBalance = true, className }: Props) => {
  const { assetsPrices } = useGlobalContext();

  const price = priceId ? assetsPrices?.[priceId] : { price: 0 };

  if (!price) {
    return <Shimmering width={100} height={20} />;
  }

  const { bn, suffix } = toFormattedBalance(balance, precision);
  const isGrow = price.change && price.change >= 0;
  const changeToShow = price.change && `${isGrow ? '+' : ''}${price.change.toFixed(2)}%`;
  const total = bn.muln(price.price);

  return (
    <div className={cnTw('flex items-center justify-between', className)}>
      <BodyText className="text-text-hint" align="left">
        <Price amount={new BN(price.price)} />
        {price.change && (
          <BodyText as="span" className={cnTw('ml-1', isGrow ? 'text-text-positive' : 'text-text-danger')}>
            {changeToShow}
          </BodyText>
        )}
      </BodyText>
      {showBalance && (
        <BodyText className="text-text-hint" align="right">
          <Price amount={total} />
          {suffix}
        </BodyText>
      )}
    </div>
  );
};
