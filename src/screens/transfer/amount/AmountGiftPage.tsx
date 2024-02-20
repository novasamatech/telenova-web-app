import { Button, CircularProgress } from '@nextui-org/react';

import { Paths } from '@/common/routing';
import { useMainButton } from '@/common/telegram/useMainButton';
import { BodyText, HeadlineText, Icon } from '@/components';
import { useAmountLogic } from './useAmountLogic';
import AmountDetails from './AmountDetails';

export default function AmountGiftPage() {
  const { mainButton } = useMainButton();
  const {
    handleMaxSend,
    handleChange,
    setIsAmountValid,
    checkBalanceDeposit,
    isPending,
    deposit,
    selectedAsset,
    amount,
    maxAmountToSend,
    isAmountValid,
  } = useAmountLogic({
    prevPage: Paths.TRANSFER_SELECT_TOKEN,
    nextPage: Paths.TRANSFER_CREATE_GIFT,
    mainButtonText: 'Enter Amount',
    onAmountChange: () => {
      mainButton.setText('Create gift');
      setIsAmountValid((prev) => prev && !!deposit && +amount >= deposit);
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
        checkBalanceDeposit={checkBalanceDeposit}
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
