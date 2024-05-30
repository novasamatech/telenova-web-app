import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

import Shimmering from '@/components/Shimmering/Shimmering';
import { formatBalance } from '@/common/utils/balance';

type Props = {
  balance?: string;
  precision?: number;
  animate?: boolean;
};

const Balance = ({ balance, precision, animate }: Props) => {
  // to prevent CountUp loosing value bug
  const [key, setKey] = useState(0);
  useEffect(() => setKey((x) => x + 1), []);

  if (!balance) {
    return <Shimmering width={100} height={20} />;
  }

  const { formattedValue, suffix, decimalPlaces } = formatBalance(balance, precision);
  const dicimal = balance === '0' ? 0 : decimalPlaces;

  return (
    <>
      <CountUp
        key={key}
        start={animate ? 0 : +formattedValue}
        end={+formattedValue}
        duration={0.4}
        preserveValue
        decimals={dicimal}
      />
      {suffix}
    </>
  );
};
export default Balance;
