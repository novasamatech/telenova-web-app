import { Button, CircularProgress } from '@nextui-org/react';

import { Paths } from '@/common/routing';
import { HeadlineText, Identicon, TruncateAddress } from '@/components';
import { useAmountLogic } from './useAmountLogic';
import AmountDetails from './AmountDetails';

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
    prevPage: Paths.TRANSFER_ADDRESS,
    nextPage: Paths.TRANSFER_CONFIRMATION,
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
          <HeadlineText className="text-text-link">
            Max: {maxAmountToSend || <CircularProgress size="sm" className="inline-block h-[22px]" />}{' '}
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
