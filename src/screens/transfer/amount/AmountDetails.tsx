import { Input } from '@nextui-org/react';

import { Icon, LargeTitleText, BodyText, TokenPrice } from '@/components';
import { IconNames } from '@/components/Icon/types';
import { TrasferAsset } from '@/common/types';

type AmountDetailsProps = {
  selectedAsset?: Partial<TrasferAsset | null>;
  amount: string;
  isAmountValid: boolean;
  maxAmountToSend: string;
  isPending: boolean;
  deposit: number;
  checkBalanceDeposit: boolean;
  handleChange: (value: string) => void;
  children?: React.ReactNode;
};

export default function AmountDetails({
  selectedAsset,
  amount,
  isAmountValid,
  maxAmountToSend,
  isPending,
  deposit,
  checkBalanceDeposit,
  handleChange,
  children,
}: AmountDetailsProps) {
  return (
    <>
      <div className="mb-6 mt-5 grid grid-cols-[40px,1fr,auto] gap-2 h-[40px] items-center">
        <Icon name={selectedAsset?.asset?.symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{selectedAsset?.asset?.symbol}</LargeTitleText>
        <Input
          fullWidth={false}
          variant="underlined"
          className="mt-[-10px] font-manrope h-full"
          classNames={{ input: ['text-right !text-large-title max-w-[160px]'] }}
          value={amount}
          isInvalid={!isAmountValid}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          onValueChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-[auto,1fr]">
        <TokenPrice
          priceId={selectedAsset?.asset?.priceId}
          balance={amount || '0'}
          showBalance={isAmountValid && !isPending}
        />
        {!isAmountValid && (
          <>
            <BodyText align="right" className="text-text-danger">
              {+amount > +maxAmountToSend ? 'Insufficient balance' : 'Invalid amount'} <br />
              {children}
            </BodyText>
          </>
        )}
      </div>
      {checkBalanceDeposit && (
        <BodyText align="left" className="text-text-hint mt-4">
          The balance that remains after sending this amount is less than the minimal network deposit ({deposit}), you
          may choose a different amount or use Max instead.
        </BodyText>
      )}
    </>
  );
}
