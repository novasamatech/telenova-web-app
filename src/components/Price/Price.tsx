import { formatFiatBalance } from '@/common/utils/balance';

type Props = {
  amount: string | number;
  symbol?: string;
};

const Price = ({ amount, symbol = '$' }: Props) => {
  const { formattedValue, suffix } = formatFiatBalance(amount);

  return (
    <>
      {symbol}
      {formattedValue} {suffix}
    </>
  );
};
export default Price;
