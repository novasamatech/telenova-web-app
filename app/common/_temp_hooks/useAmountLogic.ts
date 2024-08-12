import { useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useQueryService } from '@/common/queryService/QueryService';
import { toPrecisedBalance } from '@/shared/helpers';
import { useAssetHub } from '@/shared/hooks/useAssetHub';
import { type Asset, type Balance, type StatemineAsset } from '@/types/substrate';

type AmountLogicParams = {
  chainId: ChainId;
  asset: Asset;
  balance?: Balance;
  isGift: boolean;
};

export const useAmountLogic = ({ chainId, asset, balance, isGift }: AmountLogicParams) => {
  const { getAssetHubFee } = useAssetHub();
  const { getTransactionFee } = useExtrinsic();
  const { getExistentialDeposit } = useQueryService();

  const [fee, setFee] = useState(BN_ZERO);
  const [amount, setAmount] = useState(BN_ZERO);
  const [deposit, setDeposit] = useState(BN_ZERO);
  const [maxAmount, setMaxAmount] = useState(BN_ZERO);

  const [isTouched, setIsTouched] = useState(false);
  const [isPending, setPending] = useState(false);
  const [isTransferAll, setIsTransferAll] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(true);

  useEffect(() => {
    setPending(true);
    getTransferDetails(chainId, asset, amount)
      .then(({ fee, deposit }) => {
        setFee(fee);
        setDeposit(deposit);
      })
      .finally(() => {
        setPending(false);
      });
  }, [amount]);

  useEffect(() => {
    if (!asset) return;

    getMaxAmount(chainId, asset, balance?.transferable).then(setMaxAmount);
  }, []);

  useEffect(() => {
    if (!isTouched) return;

    const isUnderMax = amount.lte(maxAmount);
    const isOverDeposit = maxAmount.sub(amount).gte(deposit);

    setIsAmountValid(!amount.isZero() && isUnderMax && (isTransferAll || isOverDeposit));
  }, [isTransferAll, maxAmount, amount, deposit, isTouched]);

  const getFeeAmount = (chainId: ChainId, asset: Asset, transferAmount: BN): Promise<BN> => {
    const FEE_BY_TYPE: Record<Asset['type'], () => Promise<BN>> = {
      native: () => getTransactionFee(chainId, TransactionType.TRANSFER, transferAmount),
      statemine: () => getAssetHubFee(chainId, asset as StatemineAsset, transferAmount, isGift),
      orml: () => getTransactionFee(chainId, TransactionType.TRANSFER_ORML, transferAmount),
    };

    return FEE_BY_TYPE[asset.type]();
  };

  const getMaxAmount = async (chainId: ChainId, asset: Asset, transferable = BN_ZERO): Promise<BN> => {
    const fee = await getFeeAmount(chainId, asset, transferable);

    return BN.max(transferable.sub(fee), BN_ZERO);
  };

  const getTransferDetails = async (
    chainId: ChainId,
    asset: Asset,
    transferAmount: BN,
  ): Promise<{ fee: BN; deposit: BN }> => {
    const deposit = await getExistentialDeposit(chainId, asset);
    const fee = await getFeeAmount(chainId, asset, transferAmount);

    return { fee, deposit };
  };

  const getIsAccountToBeReaped = (): boolean => {
    if (amount.isZero() || fee.isZero() || !isTouched || isTransferAll || !maxAmount) return false;

    // We don't add fee to the amount because maxAmountToSend is already subtracted by fee
    // getMaxAmount is responsible for that
    return maxAmount.sub(amount).lt(deposit);
  };

  const onMaxAmount = () => {
    if (maxAmount.isZero()) return;

    setIsTransferAll(true);
    setIsTouched(true);
    setAmount(maxAmount);
    setIsAmountValid(true);
  };

  const onAmountChange = (amount: string) => {
    setIsTransferAll(false);
    setIsTouched(true);
    setAmount(toPrecisedBalance(amount, asset.precision));
  };

  return {
    onMaxAmount,
    onAmountChange,
    setIsAmountValid,
    getIsAccountToBeReaped,
    isPending,
    deposit,
    amount,
    fee,
    maxAmount,
    isAmountValid,
    isTouched,
    isTransferAll,
  };
};
