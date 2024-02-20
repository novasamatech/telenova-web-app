import { useEffect, useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { getTransferDetails } from '@/common/utils/balance';
import { TrasferAsset } from '@/common/types';

type AmountPageLogic = {
  prevPage: string;
  nextPage: string;
  mainButtonText: string;
  onAmountChange?: () => void;
};

export function useAmountLogic({ prevPage, nextPage, mainButtonText, onAmountChange = () => {} }: AmountPageLogic) {
  const navigate = useNavigate();
  const { estimateFee, getExistentialDeposit } = useExtrinsicProvider();
  const { BackButton } = useTelegram();
  const { hideMainButton, reset, addMainButton, mainButton } = useMainButton();
  const [isPending, startTransition] = useTransition();

  const { selectedAsset, setSelectedAsset } = useGlobalContext();

  const [amount, setAmount] = useState<string>('');
  const [transferAll, setTransferAll] = useState(false);
  const [maxAmountToSend, setMaxAmountToSend] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [deposit, setDeposit] = useState(0);

  useEffect(() => {
    mainButton.setText(mainButtonText);
    BackButton?.show();
    mainButton.show();
    mainButton.disable();

    const callback = () => {
      navigate(prevPage);
    };
    BackButton?.onClick(callback);

    if (!selectedAsset) return;

    (async () => {
      const { max, fee, formattedDeposit } = await getTransferDetails(
        selectedAsset as TrasferAsset,
        amount,
        estimateFee,
        getExistentialDeposit,
      );

      setDeposit(formattedDeposit);
      setMaxAmountToSend(max);
      setIsAmountValid(+amount <= +max);
      setSelectedAsset((prev) => ({ ...prev!, fee }));
    })();

    return () => {
      BackButton?.offClick(callback);
      hideMainButton();
    };
  }, [BackButton]);

  useEffect(() => {
    if (!isAmountValid || !Number(amount)) {
      mainButton.disable();
      mainButton.setText(mainButtonText);

      return;
    }

    const callback = () => {
      setSelectedAsset((prev) => ({ ...prev!, transferAll, amount }));
      navigate(nextPage);
    };
    mainButton.enable();
    addMainButton(callback);
    onAmountChange();

    return () => {
      reset();
    };
  }, [amount, isAmountValid, maxAmountToSend]);

  const handleMaxSend = () => {
    if (maxAmountToSend === '') return;
    setTransferAll(true);
    setAmount(String(maxAmountToSend));
    setIsAmountValid(Boolean(maxAmountToSend));
  };
  const handleChange = (value: string) => {
    const formattedValue = value.trim().replace(/,/g, '.');
    setTransferAll(false);
    startTransition(async () => {
      const { max, fee, formattedDeposit } = await getTransferDetails(
        selectedAsset as TrasferAsset,
        formattedValue,
        estimateFee,
        getExistentialDeposit,
      );

      setDeposit(formattedDeposit);
      setMaxAmountToSend(max);
      setSelectedAsset((prev) => ({ ...prev!, fee }));
      const checkBalanceDeposit = !transferAll && +max - +formattedValue < formattedDeposit;

      setIsAmountValid(!!Number(formattedValue) && +formattedValue <= +max && !checkBalanceDeposit);
    });
    setAmount(formattedValue);
  };

  const checkBalanceDeposit = Boolean(
    !transferAll && maxAmountToSend && amount && +maxAmountToSend - +amount < deposit,
  );

  return {
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
  };
}
