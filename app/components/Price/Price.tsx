import { cnTw } from '@/common/utils/twMerge';
import { Shimmering } from '@/components';

type Props = {
  amount?: number;
  decimalSize?: number;
  symbol?: string;
};

const Price = ({ amount, decimalSize, symbol = '$' }: Props) => {
  if (amount === undefined) {
    return <Shimmering width={50} height={30} />;
  }
  const value = amount === 0 ? '0.00' : parseFloat(amount.toFixed(3));
  const [integerPart, decimalPart] = value.toString().split('.');
  // decimalSize don't apply dynamically
  const style = decimalSize && `text-3xl`;

  return (
    <>
      <span className="text-text-hint inline-block">{symbol}</span>
      <span className="inline-block"> {integerPart}</span>
      {decimalPart && <span className={cnTw('text-text-hint inline-block', style)}>.{decimalPart}</span>}
    </>
  );
};
export default Price;
