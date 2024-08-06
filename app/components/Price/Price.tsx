import { type BN } from '@polkadot/util';

import { cnTw } from '../../shared/helpers';
import { Shimmering } from '../Shimmering/Shimmering';

type Props = {
  amount?: BN;
  symbol?: string;
  decimalSize?: 'sm' | 'lg';
};

const SIZE: Record<NonNullable<Props['decimalSize']>, string> = {
  sm: 'text-inherit',
  lg: 'text-3xl',
};

export const Price = ({ amount, symbol = '$', decimalSize = 'sm' }: Props) => {
  if (amount === undefined) {
    return <Shimmering width={50} height={30} />;
  }

  const value = amount.isZero() ? '0.00' : amount.toString(); // parseFloat(amount.toFixed(3));
  const [integerPart, decimalPart] = value.toString().split('.');

  return (
    <>
      <span className="text-text-hint inline-block">{symbol}</span>
      <span className="inline-block"> {integerPart}</span>
      {decimalPart && <span className={cnTw('text-text-hint inline-block', SIZE[decimalSize])}>.{decimalPart}</span>}
    </>
  );
};
