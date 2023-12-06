import { cnTw } from '@/common/utils/twMerge';
import { formatBalance } from '@/common/utils/balance';
import Icon from '../Icon/Icon';
import { CaptionText } from '../Typography';

type Props = {
  value: string;
  asset: any;
  className?: string;
  showIcon?: boolean;
  imgClassName?: string;
  wrapperClassName?: string;
};

export const AssetBalance = ({ value, asset, className, imgClassName }: Props) => {
  const { precision, symbol } = asset;
  const { formattedValue, suffix } = formatBalance(value, precision);

  console.log(suffix, formattedValue);

  return (
    <span className={cnTw('flex items-center gap-x-2', className)}>
      <Icon name={symbol} size={40} alt="logo" className={imgClassName} />
      <CaptionText>{symbol}</CaptionText>
      <CaptionText>
        {formattedValue} {suffix}
      </CaptionText>
    </span>
  );
};
