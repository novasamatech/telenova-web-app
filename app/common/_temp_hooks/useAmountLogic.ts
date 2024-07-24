import { useEffect, useState } from 'react';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useQueryService } from '@/common/queryService/QueryService';
import { type TransferAsset } from '@/common/types';
import { formatAmount, formatBalance, isStatemineAsset } from '@/common/utils';
import { useAssetHub } from '@/common/utils/hooks/useAssetHub';

type AmountLogicParams = {
  selectedAsset?: TransferAsset;
  isGift: boolean;
};

// TODO: Use BN to operate with amount and fee
export const useAmountLogic = ({ selectedAsset, isGift }: AmountLogicParams) => {
  const { getAssetHubFee } = useAssetHub();
  const { getTransactionFee } = useExtrinsic();
  const { getExistentialDeposit, getExistentialDepositStatemine } = useQueryService();

  const [amount, setAmount] = useState<string>(selectedAsset?.amount || '');
  const [fee, setFee] = useState<number>();
  const [touched, setTouched] = useState(false);
  const [isPending, setPending] = useState(false);
  const [transferAll, setTransferAll] = useState(false);
  const [maxAmountToSend, setMaxAmountToSend] = useState<string>('');
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [deposit, setDeposit] = useState(0);

  const getFeeAmount = (selectedAsset: TransferAsset, transferAmount: string): Promise<number> => {
    if (isStatemineAsset(selectedAsset.asset.type)) {
      return getAssetHubFee(selectedAsset.chainId, selectedAsset.asset.typeExtras!.assetId, transferAmount, isGift);
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

  const getIsAccountToBeReaped = (): boolean => {
    if (!amount || !parseFloat(amount) || !touched || transferAll || !maxAmountToSend || !fee) return false;

    // We don't add fee to the amount because maxAmountToSend is already subtracted by fee
    // getMaxAmount is responsible for that
    return Number(maxAmountToSend) - Number(amount) < deposit;
  };

  useEffect(() => {
    setPending(true);
    getTransferDetails(selectedAsset as TransferAsset, amount || '0')
      .then(({ fee, formattedDeposit }) => {
        setFee(fee);
        setDeposit(formattedDeposit);
      })
      .finally(() => {
        setPending(false);
      });
  }, [amount]);

  useEffect(() => {
    if (!selectedAsset) return;

    getMaxAmount(selectedAsset).then(setMaxAmountToSend);
  }, [selectedAsset]);

  useEffect(() => {
    if (!touched) return;

    const lessThanMax = (+amount || 0) <= +maxAmountToSend;
    const greaterThanDeposit = +maxAmountToSend - (+amount || 0) >= deposit;

    setIsAmountValid(lessThanMax && (transferAll || greaterThanDeposit));
  }, [transferAll, maxAmountToSend, amount, deposit, touched]);

  const handleMaxSend = () => {
    if (maxAmountToSend === '') return;

    setTransferAll(true);
    setTouched(true);
    setAmount(String(maxAmountToSend));
    setIsAmountValid(Boolean(parseFloat(maxAmountToSend)));
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
    getIsAccountToBeReaped,
    isPending,
    deposit,
    selectedAsset,
    amount,
    fee,
    maxAmountToSend,
    isAmountValid,
    touched,
    transferAll,
  };
};
