import { useGlobalContext } from '@/common/providers/contextProvider';
import { cnTw } from '@/common/utils';
import { formatBalance } from '@/common/utils/balance';
import { BodyText, Price, Shimmering } from '@/components';

type Props = {
  balance?: string;
  priceId?: string;
  precision?: number;
  showBalance?: boolean;
  className?: string;
};

const TokenPrice = ({ priceId, balance, precision, showBalance = true, className }: Props) => {
  const { assetsPrices } = useGlobalContext();
  const price = priceId ? assetsPrices?.[priceId] : { price: 0 };
  const { formattedValue, suffix } = formatBalance(balance, precision);

  if (!price) {
    return <Shimmering width={100} height={20} />;
  }

  const isGrow = price.change && price.change >= 0;
  const changeToShow = price.change && `${isGrow ? '+' : ''}${price.change.toFixed(2)}%`;
  const changeStyle = isGrow ? 'text-text-positive' : 'text-text-danger';
  const total = price.price * Number(formattedValue);

  return (
    <div className={cnTw('flex items-center justify-between', className)}>
      <BodyText className="text-text-hint" align="left">
        <Price amount={price.price} />
        {price.change && (
          <BodyText as="span" className={`ml-1 ${changeStyle}`}>
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
export default TokenPrice;
