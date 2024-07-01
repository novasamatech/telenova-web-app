import { useEffect, useState } from 'react';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useQueryService } from '@/common/queryService/QueryService.ts';
import { type TransferAsset } from '@/common/types';
import { formatAmount, formatBalance, isStatemineAsset } from '@/common/utils';
import { useAssetHub } from '@/common/utils/hooks/useAssetHub.ts';

type AmountPageLogic = {
  selectedAsset?: TransferAsset;
};

export function useAmountLogic({ selectedAsset }: AmountPageLogic) {
  const { getTransactionFee } = useExtrinsic();
  const { getExistentialDeposit, getExistentialDepositStatemine } = useQueryService();
  const { getAssetHubFee } = useAssetHub();

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
    setPending(true);
    getTransferDetails(selectedAsset as TransferAsset, fee?.toString() ?? '0')
      .then(({ fee, formattedDeposit }) => {
        setFee(fee);
        setDeposit(formattedDeposit);
        // setSelectedAsset(prev => ({ ...prev, fee }));
      })
      .finally(() => {
        setPending(false);
      });
  }, [fee]);

  useEffect(() => {
    if (selectedAsset) {
      getMaxAmount(selectedAsset as TransferAsset).then(setMaxAmountToSend);
    }
  }, [selectedAsset]);

  useEffect(() => {
    if (!touched) return;

    const checkBalanceDeposit = !transferAll && +maxAmountToSend - (fee || 0) < deposit;
    setIsAmountValid(!!Number(fee) && (fee || 0) <= +maxAmountToSend && !checkBalanceDeposit);
  }, [transferAll, maxAmountToSend, fee, deposit, touched]);

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
    fee,
    maxAmountToSend,
    isAmountValid,
  };
}
