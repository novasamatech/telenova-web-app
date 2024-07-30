import { cnTw } from '@/common/utils';
import { Shimmering } from '@/components';

type Props = {
  amount?: number;
  symbol?: string;
  decimalSize?: 'sm' | 'lg';
};

const SIZE: Record<NonNullable<Props['decimalSize']>, string> = {
  sm: 'text-inherit',
  lg: 'text-3xl',
};

const Price = ({ amount, symbol = '$', decimalSize = 'sm' }: Props) => {
  if (amount === undefined) {
    return <Shimmering width={50} height={30} />;
  }

  const value = amount === 0 ? '0.00' : parseFloat(amount.toFixed(3));
  const [integerPart, decimalPart] = value.toString().split('.');

  return (
    <>
      <span className="text-text-hint inline-block">{symbol}</span>
      <span className="inline-block"> {integerPart}</span>
      {decimalPart && <span className={cnTw('text-text-hint inline-block', SIZE[decimalSize])}>.{decimalPart}</span>}
    </>
  );
};
export default Price;
