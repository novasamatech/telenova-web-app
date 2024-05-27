import { useEffect, useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { formatAmount, getFormattedTransferDetails } from '@/common/utils/balance';
import { TrasferAsset } from '@/common/types';
import { useAssetHub } from '@/common/utils/hooks/useAssetHub';
import { useQueryService } from '@/common/queryService/QueryService';
import { useExtrinsic } from '@/common/extrinsicService/useExtrinsic';
import { isStatemineAsset } from '@/common/utils/assets';
import { TransactionType } from '@/common/extrinsicService/types';

type AmountPageLogic = {
  prevPage: string;
  nextPage: string;
  mainButtonText: string;
  onAmountChange?: () => void;
};

export function useAmountLogic({ prevPage, nextPage, mainButtonText, onAmountChange = () => {} }: AmountPageLogic) {
  const navigate = useNavigate();
  const { handleFee } = useExtrinsic();
  const { getExistentialDeposit, getExistentialDepositStatemine } = useQueryService();

  const { BackButton } = useTelegram();
  const { hideMainButton, reset, addMainButton, mainButton } = useMainButton();
  const [isPending, startTransition] = useTransition();
  const { getAssetHubFee } = useAssetHub();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();

  const [amount, setAmount] = useState<string>(selectedAsset?.amount || '');
  const [transferAll, setTransferAll] = useState(false);
  const [maxAmountToSend, setMaxAmountToSend] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [deposit, setDeposit] = useState(0);

  const isAccountTerminate = Boolean(!transferAll && maxAmountToSend && amount && +maxAmountToSend - +amount < deposit);

  async function getTransferDetails(selectedAsset: TrasferAsset, amount: string) {
    const transferAmmount = formatAmount(amount || '0', selectedAsset.asset?.precision as number);

    const deposit = isStatemineAsset(selectedAsset.asset.type)
      ? await getExistentialDepositStatemine(selectedAsset.chainId, selectedAsset.asset.typeExtras!.assetId)
      : await getExistentialDeposit(selectedAsset.chainId);

    const fee = isStatemineAsset(selectedAsset.asset.type)
      ? await getAssetHubFee(
          selectedAsset.chainId,
          selectedAsset.asset.typeExtras!.assetId,
          transferAmmount,
          selectedAsset.address,
          selectedAsset?.isGift,
        )
      : await handleFee(selectedAsset.chainId, TransactionType.TRANSFER, transferAmmount);

    return getFormattedTransferDetails(
      selectedAsset.asset?.precision,
      selectedAsset.transferableBalance || '0',
      deposit,
      fee,
    );
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

    if (!selectedAsset) return;

    (async () => {
      const { max, fee, formattedDeposit } = await getTransferDetails(selectedAsset as TrasferAsset, amount);

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
    if (!isAmountValid || !Number(amount) || isAccountTerminate || isPending) {
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
  }, [amount, isAmountValid, maxAmountToSend, isPending, isAccountTerminate]);

  const handleMaxSend = () => {
    if (maxAmountToSend === '') return;
    setTransferAll(true);
    setAmount(String(maxAmountToSend));
    setIsAmountValid(Boolean(maxAmountToSend));
  };

  const handleChange = (value: string) => {
    let formattedValue = value.trim().replace(/,/g, '.');
    if (formattedValue.charAt(0) === '.') {
      formattedValue = '0' + formattedValue;
    }

    setTransferAll(false);
    startTransition(async () => {
      const { max, fee, formattedDeposit } = await getTransferDetails(selectedAsset as TrasferAsset, formattedValue);

      setDeposit(formattedDeposit);
      setMaxAmountToSend(max);
      setSelectedAsset((prev) => ({ ...prev!, fee }));
      const checkBalanceDeposit = !transferAll && +max - +formattedValue < formattedDeposit;

      setIsAmountValid(!!Number(formattedValue) && +formattedValue <= +max && !checkBalanceDeposit);
    });
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
