import { Button, CircularProgress } from '@nextui-org/react';

import { Paths } from '@/common/routing';
import { useMainButton } from '@/common/telegram/useMainButton';
import { HeadlineText, Icon } from '@/components';
import AmountDetails from './AmountDetails';
import { useAmountLogic } from './useAmountLogic';

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
    onAmountChange: () => mainButton.setText('Create gift'),
  });

  const valueChange = (value: string) => {
    const formattedValue = value.trim().replace(/,/g, '.');

    handleChange(value);
    setIsAmountValid((prev) => prev && !!deposit && +formattedValue >= deposit);
  };

  const handleMaxGiftSend = () => {
    handleMaxSend();
    setIsAmountValid(Boolean(maxAmountToSend) && +maxAmountToSend >= deposit);
  };

  return (
    <>
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        <>
          <Icon name="Gift" className="w-8 h-8 text-bg-icon-accent-primary" />
          <HeadlineText>Preparing Gift</HeadlineText>
        </>
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
        handleChange={valueChange}
      />
    </>
  );
}
