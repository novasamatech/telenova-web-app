import type { AssetHubFeeParam, AssetHubGiftFeeParam } from './types';

import { formatBalance } from '../balance';
import { ZERO_BALANCE } from '../constants';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useQueryService } from '@/common/queryService/QueryService';
import { type StatemineAsset } from '@/types/substrate';

export const useAssetHub = () => {
  const { getTransactionFee } = useExtrinsic();
  const { assetConversion, getFreeBalanceStatemine } = useQueryService();

  const getTransferFee = ({ chainId, assetId, transferAmount }: AssetHubFeeParam): Promise<number> => {
    return getTransactionFee(chainId, TransactionType.TRANSFER_STATEMINE, transferAmount, assetId);
  };

  const getGiftFee = async ({ chainId, assetId, transferAmount }: AssetHubGiftFeeParam): Promise<number> => {
    const transferDotFee = await getTransferFee({ chainId, assetId, transferAmount });

    return transferDotFee * 2;
  };

  const getAssetHubFee = async (
    chainId: ChainId,
    assetId: string,
    transferAmount: string,
    isGift = false,
  ): Promise<number> => {
    const transferDotFee = isGift
      ? await getGiftFee({ chainId, assetId, transferAmount })
      : await getTransferFee({ chainId, assetId, transferAmount });

    return assetConversion(chainId, transferDotFee, assetId);
  };

  const getGiftBalanceStatemine = async (chainId: ChainId, asset: StatemineAsset, address: string): Promise<string> => {
    const assetId = asset.typeExtras.assetId;

    const giftBalance = await getFreeBalanceStatemine(address, chainId, assetId);
    if (giftBalance === ZERO_BALANCE) return ZERO_BALANCE;

    const fee = await getAssetHubFee(chainId, assetId, giftBalance);
    const rawBalance = +giftBalance - fee;

    if (rawBalance <= 0) return ZERO_BALANCE;

    return formatBalance(rawBalance.toString(), asset.precision).formattedValue;
  };

  return { getAssetHubFee, getGiftBalanceStatemine };
};
