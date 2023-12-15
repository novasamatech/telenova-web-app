import { cnTw } from '@/common/utils/twMerge';
import { formatBalance } from '@/common/utils/balance';

import { Shimmering, CaptionText, Icon } from '@/components';

type Props = {
  asset: any;
  balance?: string;
  name?: string;
  className?: string;
  imgClassName?: string;
  showArrow?: boolean;
};

const AssetBalance = ({ balance, asset, name, className, imgClassName, showArrow }: Props) => {
  const { precision, symbol } = asset;
  const { formattedValue, suffix } = formatBalance(balance, precision);

  return (
    <span className={cnTw('grid grid-cols-[50px,1fr,auto] items-center gap-x-2', className)}>
      <Icon name={symbol} size={40} alt={name} className={imgClassName} />
      <CaptionText>{symbol}</CaptionText>
      {balance === undefined ? (
        <Shimmering width={100} height={20} />
      ) : (
        <>
          <CaptionText className="flex items-center">
            {formattedValue} {suffix}
            {showArrow && <Icon name="chevronForward" className="w-4 h-4 ml-2" />}
          </CaptionText>
        </>
      )}
    </span>
  );
};

export default AssetBalance;
