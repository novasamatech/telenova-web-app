import { type PropsWithChildren, useEffect, useState } from 'react';

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
  onAmountChange: (value: string) => void;
};

export const AmountDetails = ({
  asset,
  amount,
  deposit,
  maxAmount,
  isPending,
  isAccountToBeReaped,
  isAmountValid,
  onAmountChange,
  children,
}: PropsWithChildren<Props>) => {
  const [inputAmount, setInputAmount] = useState(toFormattedBalance(amount, asset.precision).value);

  useEffect(() => {
    if (maxAmount.isZero() || amount.isZero() || !maxAmount.eq(amount)) return;

    setInputAmount(toFormattedBalance(maxAmount, asset.precision).value);
  }, [amount, maxAmount]);

  const handleAmountChange = (value: string) => {
    setInputAmount(value);
    onAmountChange(value);
  };

  return (
    <>
      <div className="-ml-1.5 mb-6 mt-5 flex items-center gap-x-2">
        <AssetIcon src={asset.icon} size={46} />
        <LargeTitleText>{asset.symbol}</LargeTitleText>
        <div className="ml-auto px-1">
          <AmountInput
            className="max-w-[7ch]"
            value={inputAmount}
            isValid={isAmountValid}
            onChange={handleAmountChange}
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
        <div className="mt-4 grid grid-cols-[auto,1fr] rounded-lg border border-border-danger bg-[#FFE2E0] p-4">
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
