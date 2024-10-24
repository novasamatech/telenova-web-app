import { Shimmering } from '../Shimmering/Shimmering';

type Props = {
  amount?: string | number;
  currency?: string;
};

export const Price = ({ amount, currency = '$' }: Props) => {
  if (amount === undefined) {
    return <Shimmering width={80} height={20} />;
  }

  const value = amount.toString() === '0' ? '0.00' : amount.toString();
  const [integerPart, decimalPart] = value.split('.');

  return (
    <>
      <span className="inline-block text-text-hint">{currency}</span>
      <span className="inline-block"> {integerPart}</span>
      {decimalPart && <span className="inline-block text-inherit">.{decimalPart}</span>}
    </>
  );
};
