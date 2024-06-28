import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useGlobalContext, useTelegram } from '@/common/providers';
import { useQueryService } from '@/common/queryService/QueryService';
import { useMainButton } from '@/common/telegram/useMainButton';
import { type TransferAsset } from '@/common/types';
import { formatAmount, formatBalance, isStatemineAsset } from '@/common/utils';
import { useAssetHub } from '@/common/utils/hooks/useAssetHub';

type AmountPageLogic = {
  prevPage: string;
  nextPage: string;
  mainButtonText: string;
  onAmountChange?: () => void;
};

export function useAmountLogic({ prevPage, nextPage, mainButtonText, onAmountChange = () => {} }: AmountPageLogic) {
  const navigate = useNavigate();
  const { getTransactionFee } = useExtrinsic();
  const { getExistentialDeposit, getExistentialDepositStatemine } = useQueryService();

  const { BackButton } = useTelegram();
  const { hideMainButton, reset, addMainButton, mainButton } = useMainButton();
  const { getAssetHubFee } = useAssetHub();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();

  const [amount, setAmount] = useState<string>(selectedAsset?.amount || '');
  const [touched, setTouched] = useState(false);
  const [isPending, setPending] = useState(false);
  const [transferAll, setTransferAll] = useState(false);
  const [maxAmountToSend, setMaxAmountToSend] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [deposit, setDeposit] = useState(0);

  const isAccountTerminate = Boolean(
    touched && !transferAll && maxAmountToSend && amount && +maxAmountToSend - +amount < deposit,
  );

  const getFeeAmount = (selectedAsset: TransferAsset, transferAmount: string): Promise<number> => {
    if (isStatemineAsset(selectedAsset.asset.type)) {
      return getAssetHubFee(
        selectedAsset.chainId,
        selectedAsset.asset.typeExtras!.assetId,
        transferAmount,
        selectedAsset.isGift,
      );
    }

    return getTransactionFee(selectedAsset.chainId, TransactionType.TRANSFER, transferAmount);
  };

  const getMaxAmount = async (selectedAsset: TransferAsset): Promise<string> => {
    const amount = selectedAsset.transferableBalance || '0';
    const fee = await getFeeAmount(selectedAsset, amount);
    const max = Math.max(+amount - fee, 0).toString();

    return Number(formatBalance(max, selectedAsset.asset.precision).formattedValue).toFixed(5);
  };

  async function getTransferDetails(
    selectedAsset: TransferAsset,
    amount: string,
  ): Promise<{ fee: number; formattedDeposit: number }> {
    const transferAmount = formatAmount(amount || '0', selectedAsset.asset?.precision);

    const deposit = isStatemineAsset(selectedAsset.asset.type)
      ? await getExistentialDepositStatemine(selectedAsset.chainId, selectedAsset.asset.typeExtras!.assetId)
      : await getExistentialDeposit(selectedAsset.chainId);

    const fee = await getFeeAmount(selectedAsset, transferAmount);

    return {
      fee,
      formattedDeposit: Number(formatBalance(deposit, selectedAsset.asset.precision).formattedValue),
    };
  }

  useEffect(() => {
    mainButton.setText(mainButtonText);
    BackButton?.show();
    mainButton.show();
    mainButton.disable();

    const callback = () => {
      navigate(prevPage);
    };
    BackButton?.onClick(callback);

    if (!selectedAsset) {
      return;
    }

    return () => {
      BackButton?.offClick(callback);
      hideMainButton();
    };
  }, [BackButton]);

  useEffect(() => {
    setPending(true);
    getTransferDetails(selectedAsset as TransferAsset, amount).then(({ fee, formattedDeposit }) => {
      setPending(false);
      setDeposit(formattedDeposit);
      setSelectedAsset(prev => ({ ...prev, fee }));
    });
  }, [amount]);

  useEffect(() => {
    if (selectedAsset) {
      getMaxAmount(selectedAsset as TransferAsset).then(setMaxAmountToSend);
    }
  }, [selectedAsset]);

  useEffect(() => {
    if (touched) {
      const checkBalanceDeposit = !transferAll && +maxAmountToSend - +amount < deposit;
      setIsAmountValid(!!Number(amount) && +amount <= +maxAmountToSend && !checkBalanceDeposit);
    }
  }, [transferAll, maxAmountToSend, amount, deposit, touched]);

  useEffect(() => {
    if (!isAmountValid || !Number(amount) || isAccountTerminate || isPending) {
      mainButton.disable();
      mainButton.setText(mainButtonText);

      return;
    }

    const callback = () => {
      setSelectedAsset(prev => ({ ...prev!, transferAll, amount }));
      navigate(nextPage);
    };
    mainButton.enable();
    addMainButton(callback);
    onAmountChange();

    return () => {
      reset();
    };
  }, [amount, isAmountValid, maxAmountToSend, isPending, isAccountTerminate]);

  const handleMaxSend = () => {
    if (maxAmountToSend === '') return;

    setTransferAll(true);
    setTouched(true);
    setAmount(String(maxAmountToSend));
    setIsAmountValid(Boolean(maxAmountToSend));
  };

  const handleChange = (value: string) => {
    let formattedValue = value.trim().replace(/,/g, '.');
    if (formattedValue.charAt(0) === '.') {
      formattedValue = '0' + formattedValue;
    }

    setTransferAll(false);
    setTouched(true);
    setAmount(formattedValue);
  };

  return {
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
  };
}
