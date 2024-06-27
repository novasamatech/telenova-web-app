import { Suspense, lazy } from 'react';

import { type IPlayerProps } from '@lottiefiles/react-lottie-player';
import { CircularProgress } from '@nextui-org/react';

import { cnTw } from '@/common/utils';

const LazyPlayer = lazy(() => import('@lottiefiles/react-lottie-player').then(x => ({ default: x.Player })));

type Props = {
  className?: string;
};

const Fallback = ({ className }: Props) => (
  <div className={cnTw('grid place-content w-[256px] h-[256px]', className)}>
    <CircularProgress />
  </div>
);

export const LottiePlayer = ({ className, ...rest }: IPlayerProps) => {
  return (
    <Suspense fallback={<Fallback className={className} />}>
      <LazyPlayer {...rest} className={cnTw('w-[256px] h-[256px]', className)} />
    </Suspense>
  );
};
