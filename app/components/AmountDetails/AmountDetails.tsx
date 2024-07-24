import { type PropsWithChildren } from 'react';

import { Input } from '@nextui-org/react';

import { BodyText, Icon, LargeTitleText, TokenPrice } from '@/components';
import { type IconNames } from '@/components/Icon/types';
import { type Asset } from '@/types/substrate';

//TODO: Change layout mobile text
type Props = {
  asset: Asset;
  amount: string;
  isAmountValid: boolean;
  maxAmountToSend: string;
  isPending: boolean;
  deposit: number;
  isAccountToBeReaped: boolean;
  handleChange: (value: string) => void;
};

export const AmountDetails = ({
  asset,
  amount,
  isAmountValid,
  maxAmountToSend,
  isPending,
  deposit,
  isAccountToBeReaped,
  handleChange,
  children,
}: PropsWithChildren<Props>) => {
  const shouldShowPrice = !isNaN(+amount) && isAmountValid && !isPending;

  return (
    <>
      <div className="mb-6 mt-5 grid grid-cols-[40px,1fr,auto] gap-2 h-[40px] items-center">
        <Icon name={asset.symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{asset.symbol}</LargeTitleText>
        <Input
          fullWidth={false}
          variant="underlined"
          className="mt-2.5 font-manrope h-full"
          classNames={{ input: ['text-right !text-large-title max-w-[7ch]'] }}
          value={amount}
          isInvalid={!isAmountValid}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          onValueChange={handleChange}
        />
      </div>

      {shouldShowPrice && (
        <TokenPrice
          className="col-span-2"
          priceId={asset.priceId}
          balance={amount || '0'}
          showBalance={!isNaN(+amount) && isAmountValid && !isPending}
        />
      )}
      {!isAmountValid && (
        <BodyText align="right" className="text-text-danger">
          {+amount > +maxAmountToSend ? 'Insufficient balance' : 'Invalid amount'} <br />
          {children}
        </BodyText>
      )}
      {isAccountToBeReaped && (
        <div className="mt-4 p-4 bg-[#FFE2E0] border border-border-danger rounded-lg grid grid-cols-[auto,1fr]">
          <Icon name="ExclamationMark" size={28} />
          <BodyText align="left" className="text-text-danger">
            The balance that remains after sending your amount is less than the minimal network deposit ({deposit}{' '}
            {asset.symbol}), please choose a different amount or use Max instead.
          </BodyText>
        </div>
      )}
    </>
  );
};
