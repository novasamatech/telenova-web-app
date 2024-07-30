import { cnTw } from '@/common/utils';
import { useToggle } from '@/common/utils/hooks';
import { Shimmering } from '@/components';

type Props = {
  src?: string;
  size?: number;
  className?: string;
};

const AssetIcon = ({ src, size = 32, className }: Props) => {
  const [isImgLoaded, toggleImgLoaded] = useToggle();

  return (
    <div className={cnTw('rounded-full', isImgLoaded && 'bg-icon-on-neutral', className)}>
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

export default AssetIcon;