import { Shimmering } from '@/components';

type Props = {
  amount?: number;
  symbol?: string;
};

const Price = ({ amount, symbol = '$' }: Props) => {
  if (amount === undefined) return <Shimmering width={50} height={30} />;
  const value = parseFloat(amount.toFixed(3));
  const [integerPart, decimalPart] = value.toString().split('.');

  return (
    <>
      <span className="text-text-hint inline-block">{symbol}</span>
      <span className="inline-block"> {integerPart}</span>
      {decimalPart && <span className="text-text-hint inline-block">.{decimalPart}</span>}
    </>
  );
};
export default Price;
