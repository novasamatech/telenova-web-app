import { Button, Progress } from '@nextui-org/react';
import { $path } from 'remix-routes';

import { HeadlineText, Identicon, TruncateAddress } from '@/components';

import AmountDetails from './AmountDetails';
import { useAmountLogic } from './useAmountLogic';

export default function AmountPage() {
  const {
    handleMaxSend,
    handleChange,
    isAccountTerminate,
    isPending,
    deposit,
    selectedAsset,
    amount,
    maxAmountToSend,
    isAmountValid,
  } = useAmountLogic({
    prevPage: $path('/transfer/direct/address'),
    nextPage: $path('/transfer/direct/confirmation'),
    mainButtonText: 'Continue',
  });

  return (
    <>
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        <Identicon address={selectedAsset?.destinationAddress} />
        <HeadlineText className="flex gap-1">
          Send to
          <TruncateAddress address={selectedAsset?.destinationAddress} className="max-w-[120px]" />
        </HeadlineText>
        <Button variant="light" size="md" className="p-2" onClick={handleMaxSend}>
          <HeadlineText className="flex items-center text-text-link">
            Max:{' '}
            {maxAmountToSend || (
              <div className="shrink-0 w-[7ch]">
                <Progress size="md" isIndeterminate />
              </div>
            )}{' '}
            {selectedAsset?.asset?.symbol}
          </HeadlineText>
        </Button>
      </div>
      <AmountDetails
        selectedAsset={selectedAsset}
        amount={amount}
        isAmountValid={isAmountValid}
        maxAmountToSend={maxAmountToSend}
        isPending={isPending}
        deposit={deposit}
        isAccountTerminate={isAccountTerminate}
        handleChange={handleChange}
      />
    </>
  );
}
