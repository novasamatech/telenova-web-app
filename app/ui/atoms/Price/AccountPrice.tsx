import { Shimmering } from '../Shimmering/Shimmering';
import { LargeTitleText } from '../Typography';

type Props = {
  amount?: string;
  currency?: string;
};

export const AccountPrice = ({ amount, currency = '$' }: Props) => {
  if (amount === undefined) {
    return <Shimmering width={120} height={54} />;
  }

  const value = amount.toString() === '0' ? '0.00' : amount.toString();
  const [integerPart, decimalPart] = value.split('.');

  return (
    <LargeTitleText>
      <span className="inline-block text-text-hint">{currency}</span>
      <span className="inline-block"> {integerPart}</span>
      {decimalPart && <span className="inline-block text-3xl text-text-hint">.{decimalPart}</span>}
    </LargeTitleText>
  );
};
