import { Button, Progress } from '@nextui-org/react';
import { $path } from 'remix-routes';

import { useMainButton } from '@/common/telegram/useMainButton';
import { BodyText, HeadlineText, Icon } from '@/components';

import AmountDetails from './AmountDetails';
import { useAmountLogic } from './useAmountLogic';

export default function AmountGiftPage() {
  const { mainButton } = useMainButton();
  const {
    handleMaxSend,
    handleChange,
    setIsAmountValid,
    isAccountTerminate,
    isPending,
    deposit,
    selectedAsset,
    amount,
    maxAmountToSend,
    isAmountValid,
  } = useAmountLogic({
    prevPage: $path('/transfer/select-token'),
    nextPage: $path('/transfer/create-gift'),
    mainButtonText: 'Enter Amount',
    onAmountChange: () => {
      mainButton.setText('Create gift');
      setIsAmountValid(prev => prev && !!deposit && +amount >= deposit);
    },
  });

  const handleMaxGiftSend = () => {
    handleMaxSend();
    setIsAmountValid(Boolean(maxAmountToSend) && +maxAmountToSend >= deposit);
  };

  return (
    <>
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        <Icon name="Gift" className="w-8 h-8 text-bg-icon-accent-primary" />
        <HeadlineText>Preparing Gift</HeadlineText>
        <Button variant="light" size="md" className="p-2" onClick={handleMaxGiftSend}>
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
      >
        {!!deposit && +amount < deposit && (
          <BodyText as="span" className="text-text-danger">
            Your gift should remain above the minimal network deposit {deposit} {selectedAsset?.asset?.symbol}
          </BodyText>
        )}
      </AmountDetails>
    </>
  );
}
