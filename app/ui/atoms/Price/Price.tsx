import { Shimmering } from '../Shimmering/Shimmering';

import { cnTw } from '@/shared/helpers';

type Props = {
  amount?: number;
  symbol?: string;
  full?: boolean;
  decimalSize?: 'sm' | 'lg';
};

const SIZE: Record<NonNullable<Props['decimalSize']>, string> = {
  sm: 'text-inherit',
  lg: 'text-3xl',
};

export const Price = ({ amount, symbol = '$', full, decimalSize = 'sm' }: Props) => {
  if (amount === undefined) {
    return <Shimmering width={50} height={30} />;
  }

  const value = amount === 0 ? '0.00' : full ? amount : parseFloat(amount.toFixed(3));
  const [integerPart, decimalPart] = value.toString().split('.');

  return (
    <>
      <span className="inline-block text-text-hint">{symbol}</span>
      <span className="inline-block"> {integerPart}</span>
      {decimalPart && <span className={cnTw('inline-block text-text-hint', SIZE[decimalSize])}>.{decimalPart}</span>}
    </>
  );
};
