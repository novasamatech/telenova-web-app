import { type FC, Suspense, lazy } from 'react';

import { type IPlayerProps } from '@lottiefiles/react-lottie-player';
import { CircularProgress } from '@nextui-org/react';

import { cnTw } from '@/common/utils';

const LazyPlayer = lazy(() => import('@lottiefiles/react-lottie-player').then(x => ({ default: x.Player })));

const Fallback: FC<{ className?: string }> = ({ className }) => (
  <div className={cnTw('grid place-content w-[256px] h-[256px]', className)}>
    <CircularProgress />
  </div>
);

export const LottiePlayer: FC<IPlayerProps> = ({ className, ...rest }) => {
  return (
    <Suspense fallback={<Fallback className={className} />}>
      <LazyPlayer {...rest} className={cnTw('w-[256px] h-[256px]', className)} />
    </Suspense>
  );
};
