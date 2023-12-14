import { cnTw } from '@/common/utils/twMerge';
import { formatBalance } from '@/common/utils/balance';

import { Shimmering, CaptionText, Icon } from '@/components';

type Props = {
  asset: any;
  balance?: string;
  name?: string;
  className?: string;
  showIcon?: boolean;
  imgClassName?: string;
  wrapperClassName?: string;
};

export const AssetBalance = ({ balance, asset, name, className, imgClassName }: Props) => {
  const { precision, symbol } = asset;
  const { formattedValue, suffix } = formatBalance(balance, precision);

  return (
    <span className={cnTw('flex items-center gap-x-2', className)}>
      <Icon name={symbol} size={40} alt={name} className={imgClassName} />
      <CaptionText>{symbol}</CaptionText>
      {balance === undefined ? (
        <Shimmering width={100} height={20} />
      ) : (
        <CaptionText>
          {formattedValue} {suffix}
        </CaptionText>
      )}
    </span>
  );
};
