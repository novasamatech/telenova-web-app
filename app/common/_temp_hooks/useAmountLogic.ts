import { useEffect, useState } from 'react';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useQueryService } from '@/common/queryService/QueryService';
import { assetUtils, formatAmount, formatBalance } from '@/common/utils';
import { useAssetHub } from '@/common/utils/hooks/useAssetHub';
import { type Asset, type Balance } from '@/types/substrate';

type AmountLogicParams = {
  chainId: ChainId;
  asset: Asset;
  balance?: Balance;
  isGift: boolean;
};

// TODO: Use BN to operate with amount and fee
export const useAmountLogic = ({ chainId, asset, balance, isGift }: AmountLogicParams) => {
  const { getAssetHubFee } = useAssetHub();
  const { getTransactionFee } = useExtrinsic();
  const { getExistentialDeposit, getExistentialDepositStatemine } = useQueryService();

  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState(0);
  const [touched, setTouched] = useState(false);
  const [isPending, setPending] = useState(false);
  const [transferAll, setTransferAll] = useState(false);
  const [maxAmountToSend, setMaxAmountToSend] = useState('');
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [deposit, setDeposit] = useState(0);

  const getFeeAmount = (chainId: ChainId, asset: Asset, transferAmount: string): Promise<number> => {
    if (assetUtils.isStatemineAsset(asset)) {
      return getAssetHubFee(chainId, asset.typeExtras.assetId, transferAmount, isGift);
    }

    return getTransactionFee(chainId, TransactionType.TRANSFER, transferAmount);
  };

  const getMaxAmount = async (chainId: ChainId, asset: Asset, transferableAmount = '0'): Promise<string> => {
    const fee = await getFeeAmount(chainId, asset, transferableAmount);
    const max = Math.max(+transferableAmount - fee, 0).toString();

    return Number(formatBalance(max, asset.precision).formattedValue).toFixed(5);
  };

  const getTransferDetails = async (
    chainId: ChainId,
    asset: Asset,
    amount: string,
  ): Promise<{ fee: number; formattedDeposit: number }> => {
    const transferAmount = formatAmount(amount || '0', asset?.precision);

    const deposit = assetUtils.isStatemineAsset(asset)
      ? await getExistentialDepositStatemine(chainId, asset.typeExtras.assetId)
      : await getExistentialDeposit(chainId);

    const fee = await getFeeAmount(chainId, asset, transferAmount);

    return {
      fee,
      formattedDeposit: Number(formatBalance(deposit, asset.precision).formattedValue),
    };
  };

  const getIsAccountToBeReaped = (): boolean => {
    if (!amount || !parseFloat(amount) || !touched || transferAll || !maxAmountToSend || !fee) return false;

    // We don't add fee to the amount because maxAmountToSend is already subtracted by fee
    // getMaxAmount is responsible for that
    return Number(maxAmountToSend) - Number(amount) < deposit;
  };

  useEffect(() => {
    setPending(true);
    getTransferDetails(chainId, asset, amount || '0')
      .then(({ fee, formattedDeposit }) => {
        setFee(fee);
        setDeposit(formattedDeposit);
      })
      .finally(() => {
        setPending(false);
      });
  }, [amount]);

  useEffect(() => {
    if (!asset) return;

    getMaxAmount(chainId, asset, balance?.transferable).then(setMaxAmountToSend);
  }, []);

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
    amount,
    fee,
    maxAmountToSend,
    isAmountValid,
    touched,
    transferAll,
  };
};
