import { type PropsWithChildren } from 'react';

import { Input } from '@nextui-org/react';

import { type BN } from '@polkadot/util';

import { Icon } from '../Icon/Icon';
import { TokenPrice } from '../Price/TokenPrice';
import { BodyText, LargeTitleText } from '../Typography';

import { AssetIcon } from '@/components';
import { type Asset } from '@/types/substrate';

//TODO: Change layout mobile text
type Props = {
  asset: Asset;
  amount: BN;
  deposit: BN;
  maxAmount: BN;
  isAmountValid: boolean;
  isPending: boolean;
  isAccountToBeReaped: boolean;
  handleChange: (value: string) => void;
};

export const AmountDetails = ({
  asset,
  amount,
  deposit,
  maxAmount,
  isPending,
  isAccountToBeReaped,
  isAmountValid,
  handleChange,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <>
      <div className="flex gap-x-2 items-center mb-6 mt-5 -ml-1.5">
        <AssetIcon src={asset.icon} size={46} />
        <LargeTitleText>{asset.symbol}</LargeTitleText>
        <Input
          fullWidth={false}
          variant="underlined"
          className="font-manrope w-max ml-auto mt-2.5 "
          classNames={{ input: ['text-right !text-large-title max-w-[7ch]'] }}
          // value={amount.toString()}
          isInvalid={!isAmountValid}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          onValueChange={handleChange}
        />
      </div>

      {isAmountValid && !isPending && (
        <TokenPrice
          className="col-span-2"
          priceId={asset.priceId}
          balance={amount}
          showBalance={!isNaN(+amount) && isAmountValid && !isPending}
        />
      )}
      {!isAmountValid && (
        <BodyText align="right" className="text-text-danger">
          {+amount > +maxAmount ? 'Insufficient balance' : 'Invalid amount'} <br />
          {children}
        </BodyText>
      )}
      {isAccountToBeReaped && (
        <div className="mt-4 p-4 bg-[#FFE2E0] border border-border-danger rounded-lg grid grid-cols-[auto,1fr]">
          <Icon name="ExclamationMark" size={28} />
          <BodyText align="left" className="text-text-danger">
            The balance that remains after sending your amount is less than the minimal network deposit (
            {deposit.toString()} {asset.symbol}), please choose a different amount or use Max instead.
          </BodyText>
        </div>
      )}
    </>
  );
};
