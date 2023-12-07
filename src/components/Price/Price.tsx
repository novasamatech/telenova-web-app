import { formatFiatBalance } from '@/common/utils/balance';
import { LargeTitleText } from '../Typography';

type Props = {
  amount: string;
  symbol?: string;
};

const Price = ({ amount, symbol = '$' }: Props) => {
  const { formattedValue, suffix } = formatFiatBalance(amount);

  return (
    <>
      <LargeTitleText>
        {symbol}
        {formattedValue} {suffix}
      </LargeTitleText>
    </>
  );
};
export default Price;
