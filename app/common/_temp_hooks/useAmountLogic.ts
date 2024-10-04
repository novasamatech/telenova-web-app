import { useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { type IBalance, type ITransfer } from '@/shared/api/types';
import { toPreciseBalance } from '@/shared/helpers';
import { type Asset, type Balance } from '@/types/substrate';

type AmountLogicParams = {
  services: {
    transferService: ITransfer;
    balanceService: IBalance;
  };
  asset: Asset;
  balance?: Balance;
  isGift: boolean;
};

export const useAmountLogic = ({ services, asset, balance, isGift }: AmountLogicParams) => {
  const [fee, setFee] = useState(BN_ZERO);
  const [amount, setAmount] = useState(BN_ZERO);
  const [deposit, setDeposit] = useState(BN_ZERO);
  const [maxAmount, setMaxAmount] = useState(BN_ZERO);

  const [isTouched, setIsTouched] = useState(false);
  const [isPending, setPending] = useState(false);
  const [isMaxPending, setIsMaxPending] = useState(true);
  const [isTransferAll, setIsTransferAll] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(true);

  const { balanceService, transferService } = services;

  useEffect(() => {
    if (amount.isZero()) return;

    setPending(true);
    const feeParams = { amount, transferAll: isTransferAll };

    Promise.all([
      isGift ? transferService.getGiftTransferFee(feeParams) : transferService.getTransferFee(feeParams),
      balanceService.getExistentialDeposit(),
    ])
      .then(([fee, deposit]) => {
        setFee(fee);
        setDeposit(deposit);
      })
      .finally(() => setPending(false));
  }, [amount, isTransferAll]);

  useEffect(() => {
    if (!asset) return;

    getMaxAmount(balance?.transferable)
      .then(setMaxAmount)
      .finally(() => setIsMaxPending(false));
  }, []);

  useEffect(() => {
    if (!isTouched) return;

    const isUnderMax = amount.lte(maxAmount);
    const isOverDeposit = maxAmount.sub(amount).gte(deposit);

    setIsAmountValid(!amount.isZero() && isUnderMax && (isTransferAll || isOverDeposit));
  }, [isTransferAll, maxAmount, amount, deposit, isTouched]);

  const getMaxAmount = async (transferable = BN_ZERO): Promise<BN> => {
    const feeParams = { amount: transferable, transferAll: true };
    const fee = isGift
      ? await transferService.getGiftTransferFee(feeParams)
      : await transferService.getTransferFee(feeParams);

    return BN.max(transferable.sub(fee), BN_ZERO);
  };

  const getIsAccountToBeReaped = (): boolean => {
    if (amount.isZero() || fee.isZero() || !isTouched || isTransferAll) return false;

    // We don't add fee to the amount because maxAmount is already subtracted by fee
    return maxAmount.sub(amount).lt(deposit);
  };

  const onMaxAmount = () => {
    setAmount(maxAmount);
    setIsTransferAll(true);
    setIsTouched(true);
    setIsAmountValid(!maxAmount.isZero());
  };

  const onAmountChange = (amount: string) => {
    setIsTransferAll(false);
    setIsTouched(true);
    setAmount(toPreciseBalance(amount, asset.precision));
  };

  return {
    onMaxAmount,
    onAmountChange,
    setIsAmountValid,
    getIsAccountToBeReaped,
    deposit,
    amount,
    fee,
    maxAmount,
    isAmountValid,
    isTouched,
    isTransferAll,
    isPending,
    isMaxPending,
  };
};
