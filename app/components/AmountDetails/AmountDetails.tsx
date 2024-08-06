import { type PropsWithChildren } from 'react';

import { type BN } from '@polkadot/util';

import { AmountInput } from '../AmountInput/AmountInput';
import { Icon } from '../Icon/Icon';
import { TokenPrice } from '../Price/TokenPrice';
import { BodyText, LargeTitleText } from '../Typography';

import { AssetIcon } from '@/components';
import { toFormattedBalance } from '@/shared/helpers';
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
        <div className="px-1 ml-auto">
          <AmountInput
            className="max-w-[7ch]"
            value={toFormattedBalance(amount, asset.precision).value}
            isValid={isAmountValid}
            onChange={handleChange}
          />
        </div>
      </div>

      {isAmountValid && !isPending && <TokenPrice showBalance className="col-span-2" balance={amount} asset={asset} />}
      {!isAmountValid && (
        <BodyText align="right" className="text-text-danger">
          {amount.gt(maxAmount) ? 'Insufficient balance' : 'Invalid amount'} <br />
          {children}
        </BodyText>
      )}
      {isAccountToBeReaped && (
        <div className="mt-4 p-4 bg-[#FFE2E0] border border-border-danger rounded-lg grid grid-cols-[auto,1fr]">
          <Icon name="ExclamationMark" size={28} />
          <BodyText align="left" className="text-text-danger">
            The balance that remains after sending your amount is less than the minimal network deposit (
            {toFormattedBalance(deposit, asset.precision).value} {asset.symbol}), please choose a different amount or
            use Max instead.
          </BodyText>
        </div>
      )}
    </>
  );
};
