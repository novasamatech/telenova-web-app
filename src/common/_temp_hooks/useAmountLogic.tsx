import { useEffect, useState } from 'react';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useGlobalContext } from '@/common/providers';
import { useQueryService } from '@/common/queryService/QueryService.ts';
import { type TrasferAsset } from '@/common/types';
import { formatAmount, formatBalance, isStatemineAsset } from '@/common/utils';
import { useAssetHub } from '@/common/utils/hooks/useAssetHub.ts';

type AmountPageLogic = {
  selectedAsset?: TrasferAsset;
  onAmountChange?: () => void;
};

export function useAmountLogic({ selectedAsset }: AmountPageLogic) {
  const { handleFee } = useExtrinsic();
  const { getExistentialDeposit, getExistentialDepositStatemine } = useQueryService();

  const { getAssetHubFee } = useAssetHub();
  const { setSelectedAsset } = useGlobalContext();

  const [amount, setAmount] = useState<string>(selectedAsset?.amount || '');
  const [fee, setFee] = useState<number>();
  const [touched, setTouched] = useState(false);
  const [isPending, setPending] = useState(false);
  const [transferAll, setTransferAll] = useState(false);
  const [maxAmountToSend, setMaxAmountToSend] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [deposit, setDeposit] = useState(0);

  const isAccountTerminate = Boolean(
    touched && !transferAll && maxAmountToSend && fee && +maxAmountToSend - +fee < deposit,
  );

  const handleAmountFee = async (selectedAsset: TrasferAsset, transferAmount: string) => {
    return isStatemineAsset(selectedAsset.asset.type)
      ? await getAssetHubFee(
          selectedAsset.chainId,
          selectedAsset.asset.typeExtras!.assetId,
          transferAmount,
          selectedAsset.address,
          selectedAsset?.isGift,
        )
      : await handleFee(selectedAsset.chainId, TransactionType.TRANSFER, transferAmount);
  };

  const getMaxAmount = async (selectedAsset: TrasferAsset) => {
    const amount = selectedAsset.transferableBalance || '0';
    const fee = await handleAmountFee(selectedAsset, amount);
    const max = Math.max(+amount - fee, 0).toString();
    const formattedMax = Number(formatBalance(max, selectedAsset.asset.precision).formattedValue).toFixed(5);

    return formattedMax;
  };

  async function getTransferDetails(selectedAsset: TrasferAsset, amount: string) {
    const transferAmmount = formatAmount(amount || '0', selectedAsset.asset?.precision);

    const deposit = isStatemineAsset(selectedAsset.asset.type)
      ? await getExistentialDepositStatemine(selectedAsset.chainId, selectedAsset.asset.typeExtras!.assetId)
      : await getExistentialDeposit(selectedAsset.chainId);

    const fee = await handleAmountFee(selectedAsset, transferAmmount);

    return {
      fee,
      formattedDeposit: Number(formatBalance(deposit, selectedAsset.asset.precision).formattedValue),
    };
  }

  useEffect(() => {
    setPending(true);
    getTransferDetails(selectedAsset as TrasferAsset, fee?.toString() ?? '0').then(({ fee, formattedDeposit }) => {
      setPending(false);
      setFee(fee);
      setDeposit(formattedDeposit);
      setSelectedAsset(prev => ({ ...prev, fee }));
    });
  }, [fee]);

  useEffect(() => {
    if (selectedAsset) {
      getMaxAmount(selectedAsset as TrasferAsset).then(setMaxAmountToSend);
    }
  }, [selectedAsset]);

  useEffect(() => {
    if (touched) {
      const checkBalanceDeposit = !transferAll && +maxAmountToSend - (fee || 0) < deposit;
      setIsAmountValid(!!Number(fee) && (fee || 0) <= +maxAmountToSend && !checkBalanceDeposit);
    }
  }, [transferAll, maxAmountToSend, fee, deposit, touched]);

  const handleMaxSend = () => {
    if (maxAmountToSend === '') {
      return;
    }
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
    fee,
    maxAmountToSend,
    isAmountValid,
  };
}
