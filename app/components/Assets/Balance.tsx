import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

import { formatBalance } from '@/common/utils/balance';
import Shimmering from '@/components/Shimmering/Shimmering';

type Props = {
  balance?: string;
  precision?: number;
  animate?: boolean;
};

const Balance = ({ balance, precision, animate }: Props) => {
  // to prevent CountUp loosing value bug
  const [key, setKey] = useState(0);

  useEffect(() => setKey(key => key + 1), []);

  if (balance === undefined) {
    return <Shimmering width={100} height={20} />;
  }

  const { formattedValue, suffix, decimalPlaces } = formatBalance(balance, precision);
  const decimals = balance === '0' ? 0 : decimalPlaces;

  return (
    <>
      <CountUp
        key={key}
        start={animate ? 0 : +formattedValue}
        end={+formattedValue}
        duration={0.4}
        preserveValue
        decimals={decimals}
      />
      {suffix}
    </>
  );
};
export default Balance;
