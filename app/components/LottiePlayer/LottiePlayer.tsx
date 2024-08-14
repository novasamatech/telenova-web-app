import { Suspense, lazy } from 'react';

import { type IPlayerProps } from '@lottiefiles/react-lottie-player';
import { CircularProgress } from '@nextui-org/react';

import { cnTw } from '@/shared/helpers';

const LazyPlayer = lazy(() => {
  return import('@lottiefiles/react-lottie-player').then(lottie => ({ default: lottie.Player }));
});

type Props = {
  className?: string;
};

const Fallback = ({ className }: Props) => (
  <div className={cnTw('place-content grid h-[256px] w-[256px]', className)}>
    <CircularProgress />
  </div>
);

export const LottiePlayer = ({ className, ...rest }: IPlayerProps) => {
  return (
    <Suspense fallback={<Fallback className={className} />}>
      <LazyPlayer {...rest} className={cnTw('h-[256px] w-[256px]', className)} />
    </Suspense>
  );
};
