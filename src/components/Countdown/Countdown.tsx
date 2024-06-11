import { useEffect, useState } from 'react';

type Props = {
  initValue: number;
  onFinish: () => void;
};

export default function Countdown({ initValue, onFinish }: Props) {
  const [counter, setCounter] = useState(initValue);

  useEffect(() => {
    if (counter === 0) {
      onFinish();

      return;
    }
    const timer = setTimeout(() => setCounter(counter - 1), 1000);

    return () => clearTimeout(timer);
  }, [counter]);

  if (counter === 0) return '';

  return <span>({counter} sec)</span>;
}
