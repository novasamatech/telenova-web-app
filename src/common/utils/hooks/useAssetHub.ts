import type { GetTransferFee } from './types';

import { formatBalance } from '../balance';
import { ZERO_BALANCE } from '../constants';

import type { Asset } from '@/common/chainRegistry/types';
import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useQueryService } from '@/common/queryService/QueryService';
import type { ChainId } from '@/common/types';

const DOT_ASSET_ID = '0';

export const useAssetHub = () => {
  const { getTransactionFee } = useExtrinsic();
  const { assetConversion, getExistentialDeposit, getFreeBalanceStatemine } = useQueryService();

  const getTransferFee: GetTransferFee = async ({ chainId, assetId, transferAmount, address }) => {
    const transferDotFee = await getTransactionFee(
      chainId as ChainId,
      TransactionType.TRANSFER_STATEMINE,
      transferAmount,
      assetId,
    );
    // TODO: Delete it after PR for asset hub is merged
    const dotED = Number(await getExistentialDeposit(chainId));
    const dotAHBalance = address ? await getFreeBalanceStatemine(address, chainId, DOT_ASSET_ID) : ZERO_BALANCE;

    const totalDotFee = +dotAHBalance < dotED ? transferDotFee + dotED : transferDotFee;

    return { transferDotFee, dotED, totalDotFee };
  };

  const getAssetHubFee = async (
    chainId: ChainId,
    assetId: string,
    transferAmount: string,
    address?: string,
  ): Promise<number> => {
    const { totalDotFee } = await getTransferFee({ chainId, assetId, transferAmount, address });

    return assetConversion(chainId, totalDotFee, assetId);
  };

  const getGiftBalanceStatemine = async (chainId: ChainId, asset: Asset, address: string): Promise<string> => {
    const assetId = asset.typeExtras!.assetId;

    const giftBalance = await getFreeBalanceStatemine(address, chainId, assetId);
    if (giftBalance === ZERO_BALANCE) {
      return ZERO_BALANCE;
    }

    const fee = await getAssetHubFee(chainId, assetId, giftBalance, address);
    const rawBalance = +giftBalance - fee;
    if (rawBalance <= 0) {
      return ZERO_BALANCE;
    }

    return formatBalance(rawBalance.toString(), asset.precision).formattedValue;
  };

  return { getAssetHubFee, getGiftBalanceStatemine };
};
