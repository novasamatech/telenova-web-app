import { Shimmering } from '..';
import { formatBalance } from '@/common/utils/balance';

type Props = {
  balance?: string;
  precision?: number;
};

const Balance = ({ balance, precision }: Props) => {
  if (!balance) {
    return <Shimmering width={100} height={20} />;
  }

  const { formattedValue, suffix } = formatBalance(balance, precision);

  return (
    <>
      {formattedValue} {suffix}
    </>
  );
};
export default Balance;
