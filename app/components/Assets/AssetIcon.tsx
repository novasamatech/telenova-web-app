import { useEffect } from 'react';

import { Shimmering } from '../Shimmering/Shimmering';

import { useToggle } from '@/common/utils/hooks';

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
    return <Shimmering circle width={size} height={size} className={className} />;
  }

  return <img alt="" src={src} className={className} style={{ width: size, height: size }} />;
};
