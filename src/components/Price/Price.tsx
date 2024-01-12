import { formatFiatBalance } from '@/common/utils/balance';
import { Shimmering } from '@/components';

type Props = {
  amount?: string | number;
  symbol?: string;
};

const Price = ({ amount, symbol = '$' }: Props) => {
  if (amount === undefined) return <Shimmering width={50} height={30} />;
  const { formattedValue, suffix } = formatFiatBalance(amount);

  return (
    <>
      {symbol}
      {formattedValue} {suffix}
    </>
  );
};
export default Price;
