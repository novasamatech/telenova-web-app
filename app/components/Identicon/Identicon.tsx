import { Identicon as PolkadotIdenticon } from '@polkadot/react-identicon';
import { type IconTheme } from '@polkadot/react-identicon/types';

import { cnTw } from '@/common/utils/twMerge';

type Props = {
  address?: string;
  theme?: IconTheme;
  size?: number;
  background?: boolean;
  className?: string;
};

export const Identicon = ({ address, theme = 'polkadot', background = true, size = 32, className }: Props) => {
  return (
    <div
      className={cnTw('relative flex justify-center items-center', background && 'bg-white rounded-full', className)}
      style={{ width: size, height: size }}
    >
      <PolkadotIdenticon
        theme={theme}
        value={address}
        className="pointer-events-none"
        size={background ? size * 0.65 : size}
      />
    </div>
  );
};
