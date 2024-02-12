import { Shimmering } from '@/components';

type Props = {
  amount?: number;
  symbol?: string;
};

const Price = ({ amount, symbol = '$' }: Props) => {
  if (amount === undefined) return <Shimmering width={50} height={30} />;
  const value = parseFloat(amount.toFixed(3));

  return (
    <>
      {symbol}
      {value}
    </>
  );
};
export default Price;
