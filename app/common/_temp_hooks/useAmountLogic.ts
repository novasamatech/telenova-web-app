import { useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import type { Connection } from '@/models/network/types';
import { balancesFactory, transferFactory } from '@/shared/api';
import { type IBalance } from '@/shared/api/blockchain/balances/types.ts';
import { type ITransfer } from '@/shared/api/blockchain/transfer/types.ts';
import { toPreciseBalance } from '@/shared/helpers';
import { type Asset, type Balance } from '@/types/substrate';

type AmountLogicParams = {
  chainId: ChainId;
  asset: Asset;
  connection?: Connection;
  balance?: Balance;
  isGift: boolean;
};

export const useAmountLogic = ({ chainId, connection, asset, balance, isGift }: AmountLogicParams) => {
  const [fee, setFee] = useState(BN_ZERO);
  const [amount, setAmount] = useState<BN | null>(null);
  const [deposit, setDeposit] = useState(BN_ZERO);
  const [maxAmount, setMaxAmount] = useState(BN_ZERO);

  const [isTouched, setIsTouched] = useState(false);
  const [isPending, setPending] = useState(false);
  const [isMaxPending, setIsMaxPending] = useState(true);
  const [isTransferAll, setIsTransferAll] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(true);

  const [balanceService, setBalanceService] = useState<IBalance | null>(null);
  const [transferService, setTransferService] = useState<ITransfer | null>(null);

  useEffect(() => {
    if (!connection?.client) return;

    setBalanceService(balancesFactory.createService(chainId, connection.client, asset));
    setTransferService(transferFactory.createService(chainId, connection.client, asset));
  }, [connection]);

  useEffect(() => {
    if (!amount || amount.isZero() || !transferService || !balanceService) return;

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
  }, [transferService, balanceService, amount, isTransferAll]);

  useEffect(() => {
    if (!asset || !balance || !transferService) {
      setMaxAmount(BN_ZERO);

      return;
    }

    const feeParams = { amount: balance.transferable, transferAll: true };
    const getFee = isGift ? transferService.getGiftTransferFee(feeParams) : transferService.getTransferFee(feeParams);

    getFee
      .then(fee => setMaxAmount(BN.max(balance.transferable.sub(fee), BN_ZERO)))
      .finally(() => setIsMaxPending(false));
  }, [transferService, balance]);

  useEffect(() => {
    if (!isTouched || !amount) return;

    const isUnderMax = amount.lte(maxAmount);
    const isOverDeposit = maxAmount.sub(amount).gte(deposit);

    setIsAmountValid(!amount.isZero() && isUnderMax && (isTransferAll || isOverDeposit));
  }, [isTransferAll, maxAmount, amount, deposit, isTouched]);

  const getIsAccountToBeReaped = (): boolean => {
    if (!amount || amount.isZero() || fee.isZero() || !isTouched || isTransferAll) return false;

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
