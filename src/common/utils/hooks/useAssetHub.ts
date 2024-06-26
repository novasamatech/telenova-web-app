import type { GetAssetHubGiftFee, GetTransferFee } from './types';

import { formatBalance } from '../balance';
import { ZERO_BALANCE } from '../constants';

import type { Asset } from '@/common/chainRegistry/types';
import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useQueryService } from '@/common/queryService/QueryService';
import type { ChainId } from '@/common/types';

const DOT_ASSET_ID = '0';

export const useAssetHub = () => {
  const { handleFee } = useExtrinsic();
  const { assetConversion, getExistentialDeposit, getFreeBalanceStatemine } = useQueryService();

  const getTransferFee: GetTransferFee = async ({ chainId, assetId, transferAmmount, address }) => {
    const transferDotFee = await handleFee(
      chainId as ChainId,
      TransactionType.TRANSFER_STATEMINE,
      transferAmmount,
      assetId,
    );
    // TODO: Delete it after PR for asset hub is merged
    const dotED = Number(await getExistentialDeposit(chainId));
    const dotAHBalance = address ? await getFreeBalanceStatemine(address, chainId, DOT_ASSET_ID) : ZERO_BALANCE;

    const totalDotFee = +dotAHBalance < dotED ? transferDotFee + dotED : transferDotFee;

    return { transferDotFee, dotED, totalDotFee };
  };

  const getGiftFee: GetAssetHubGiftFee = async ({ chainId, assetId, transferAmmount, address }) => {
    const { transferDotFee, dotED, totalDotFee } = await getTransferFee({
      chainId,
      assetId,
      transferAmmount,
      address,
    });

    // Add more fee if it's a gift
    return {
      totalDotFee: totalDotFee + transferDotFee + dotED,
    };
  };

  const getAssetHubFee = async (
    chainId: ChainId,
    assetId: string,
    transferAmmount: string,
    address?: string,
    isGift?: boolean,
  ): Promise<number> => {
    const { totalDotFee } = isGift
      ? await getGiftFee({ chainId, assetId, transferAmmount, address })
      : await getTransferFee({ chainId, assetId, transferAmmount, address });

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
