import { useEffect } from 'react';

import { useToggle } from '../../shared/hooks';
import { Shimmering } from '../Shimmering/Shimmering';

import { cnTw } from '@/shared/helpers';

type Props = {
  src: string;
  size?: number;
  className?: string;
};

export const AssetIcon = ({ src, size = 32, className }: Props) => {
  const [isImgLoaded, toggleImgLoaded] = useToggle();

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = toggleImgLoaded;
  }, []);

  if (!isImgLoaded) {
    return (
      // Asset SVG icon has empty space between border and real icon
      <div
        className={cnTw('flex items-center justify-center', className)}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <Shimmering circle width={Math.round(size * 0.75)} />
      </div>
    );
  }

  return <img alt="" src={src} className={className} style={{ width: size, height: size }} />;
};
