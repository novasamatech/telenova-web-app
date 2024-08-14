import { Suspense, lazy, useEffect, useState } from 'react';

import { type IPlayerProps } from '@lottiefiles/react-lottie-player';
import { CircularProgress } from '@nextui-org/react';

import { cnTw, isFulfilled } from '@/shared/helpers';

const LazyPlayer = lazy(async () => {
  const lottie = await import('@lottiefiles/react-lottie-player');

  return { default: lottie.Player };
});

type Props = {
  className?: string;
};

const Fallback = ({ className }: Props) => (
  <div className={cnTw('grid place-content-center w-[256px] h-[256px]', className)}>
    <CircularProgress />
  </div>
);

export const LottiePlayer = ({ className, sources, ...rest }: { sources: string[] } & Omit<IPlayerProps, 'src'>) => {
  const [lottieSource, setLottieSource] = useState<object | null>(null);

  useEffect(() => {
    const requests = sources.map(url =>
      fetch(url).then(response => (response.ok ? response.json() : Promise.reject())),
    );

    Promise.allSettled(requests).then(results => {
      const fulfilledLotties = results.filter(isFulfilled);
      if (fulfilledLotties.length === 0) return;

      setLottieSource(fulfilledLotties[0].value);
    });
  }, []);

  return (
    <Suspense fallback={<Fallback className={className} />}>
      {lottieSource && <LazyPlayer {...rest} src={lottieSource} className={cnTw('w-[256px] h-[256px]', className)} />}
    </Suspense>
  );
};
