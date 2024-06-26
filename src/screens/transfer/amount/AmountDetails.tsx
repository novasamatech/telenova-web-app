import { Input } from '@nextui-org/react';

import { type TrasferAsset } from '@/common/types';
import { BodyText, Icon, LargeTitleText, TokenPrice } from '@/components';
import { type IconNames } from '@/components/Icon/types';

type Props = {
  selectedAsset?: Partial<TrasferAsset | null>;
  amount: string;
  isAmountValid: boolean;
  maxAmountToSend: string;
  isPending: boolean;
  deposit: number;
  isAccountTerminate: boolean;
  handleChange: (value: string) => void;
  children?: React.ReactNode;
};
//TODO: change layout mobile text

const AmountDetails = ({
  selectedAsset,
  amount,
  isAmountValid,
  maxAmountToSend,
  isPending,
  deposit,
  isAccountTerminate,
  handleChange,
  children,
}: Props) => {
  const shouldShowPrice = !isNaN(+amount) && isAmountValid && !isPending;

  return (
    <>
      <div className="mb-6 mt-5 grid grid-cols-[40px,1fr,auto] gap-2 h-[40px] items-center">
        <Icon name={selectedAsset?.asset?.symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{selectedAsset?.asset?.symbol}</LargeTitleText>
        <Input
          fullWidth={false}
          variant="underlined"
          className="mt-[-10px] font-manrope h-full"
          classNames={{ input: ['text-right !text-large-title max-w-[7ch]'] }}
          value={amount}
          isInvalid={!isAmountValid}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          onValueChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-[auto,1fr]">
        {shouldShowPrice && (
          <TokenPrice
            priceId={selectedAsset?.asset?.priceId}
            balance={amount || '0'}
            showBalance={!isNaN(+amount) && isAmountValid && !isPending}
          />
        )}
        {!isAmountValid && (
          <>
            <BodyText align="right" className="text-text-danger">
              {+amount > +maxAmountToSend ? 'Insufficient balance' : 'Invalid amount'} <br />
              {children}
            </BodyText>
          </>
        )}
      </div>
      {isAccountTerminate && (
        <div className="mt-4 p-4 bg-[#FFE2E0] border border-border-danger rounded-lg grid grid-cols-[auto,1fr]">
          <Icon name="ExclamationMark" size={28} />
          <BodyText align="left" className="text-text-danger">
            The balance that remains after sending your amount is less than the minimal network deposit ({deposit}{' '}
            {selectedAsset?.asset?.symbol}), please choose a different amount or use Max instead.
          </BodyText>
        </div>
      )}
    </>
  );
};

export default AmountDetails;
