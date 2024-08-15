import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

import { type BN } from '@polkadot/util';

import { Shimmering } from '../Shimmering/Shimmering';

import { toFormattedBalance } from '@/shared/helpers/balance';

type Props = {
  balance?: BN;
  precision?: number;
  animate?: boolean;
};

export const Balance = ({ balance, precision, animate }: Props) => {
  // to prevent CountUp loosing value bug
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(key => key + 1);
  }, []);

  if (balance === undefined) {
    return <Shimmering width={100} height={20} />;
  }

  const { formatted, bn, suffix, decimalPlaces } = toFormattedBalance(balance, precision);
  const decimals = bn.isZero() ? 0 : decimalPlaces;

  return (
    <>
      <CountUp
        key={key}
        start={animate ? 0 : Number(formatted)}
        end={Number(formatted)}
        duration={0.4}
        preserveValue
        decimals={decimals}
      />
      {suffix}
    </>
  );
};
