import { Shimmering } from '../Shimmering/Shimmering';

import { cnTw } from '@/common/utils';
import { useToggle } from '@/common/utils/hooks';

type Props = {
  src?: string;
  size?: number;
  className?: string;
};

export const AssetIcon = ({ src, size = 32, className }: Props) => {
  const [isImgLoaded, toggleImgLoaded] = useToggle();

  return (
    <div className={cnTw('rounded-full', className)}>
      {/* FIXME: can have Shimmering & img at the same time bloating container in height */}
      {!isImgLoaded && <Shimmering circle width={size} height={size} className={className} />}
      <img
        alt=""
        src={src}
        className={cnTw(!isImgLoaded && 'opacity-0')}
        style={{ width: size, height: size }}
        onLoad={toggleImgLoaded}
      />
    </div>
  );
};
