import { type PropsWithChildren } from 'react';

import { type TransferAsset } from '@/common/types';
import { AmountInput, BodyText, Icon, LargeTitleText, TokenPrice } from '@/components';
import { type IconNames } from '@/components/Icon/types';

//TODO: Change layout mobile text
type Props = {
  selectedAsset?: Partial<TransferAsset | null>;
  amount: string;
  isAmountValid: boolean;
  maxAmountToSend: string;
  isPending: boolean;
  deposit: number;
  isAccountToBeReaped: boolean;
  handleChange: (value: string) => void;
};

export const AmountDetails = ({
  selectedAsset,
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
      <div className="mb-6 mt-5 grid grid-cols-[40px,1fr,auto] gap-x-2 items-center">
        <Icon name={selectedAsset?.asset?.symbol as IconNames} size={40} />
        <LargeTitleText>{selectedAsset?.asset?.symbol}</LargeTitleText>
        <div className="px-1">
          <AmountInput className="max-w-[7ch]" value={amount} isValid={isAmountValid} onChange={handleChange} />
        </div>
      </div>

      {shouldShowPrice && (
        <TokenPrice
          className="col-span-2"
          priceId={selectedAsset?.asset?.priceId}
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
            {selectedAsset?.asset?.symbol}), please choose a different amount or use Max instead.
          </BodyText>
        </div>
      )}
    </>
  );
};
