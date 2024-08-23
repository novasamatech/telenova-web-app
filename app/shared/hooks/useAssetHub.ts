import { type BN, BN_ZERO } from '@polkadot/util';

import { assetUtils } from '../helpers';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useQueryService } from '@/common/queryService/QueryService';
import { type StatemineAsset } from '@/types/substrate';

type AssetHubFeeParam = {
  chainId: ChainId;
  assetId: string;
  transferAmount: BN;
};

type AssetHubGiftFeeParam = AssetHubFeeParam & {
  isGift?: boolean;
};

export const useAssetHub = () => {
  const { getTransactionFee } = useExtrinsic();
  const { assetConversion, getFreeBalanceStatemine } = useQueryService();

  const getTransferFee = ({ chainId, assetId, transferAmount }: AssetHubFeeParam): Promise<BN> => {
    return getTransactionFee(chainId, TransactionType.TRANSFER_STATEMINE, transferAmount, assetId);
  };

  const getGiftFee = async ({ chainId, assetId, transferAmount }: AssetHubGiftFeeParam): Promise<BN> => {
    const transferDotFee = await getTransferFee({ chainId, assetId, transferAmount });

    return transferDotFee.muln(2);
  };

  // TODO: currently USDT only
  const getAssetHubFee = async (
    chainId: ChainId,
    asset: StatemineAsset,
    transferAmount: BN,
    isGift = false,
  ): Promise<BN> => {
    const assetId = assetUtils.getAssetId(asset);

    const transferDotFee = isGift
      ? await getGiftFee({ chainId, assetId, transferAmount })
      : await getTransferFee({ chainId, assetId, transferAmount });

    return assetConversion(chainId, transferDotFee, assetId);
  };

  const getGiftBalanceStatemine = async (chainId: ChainId, address: string, asset: StatemineAsset): Promise<BN> => {
    const assetId = asset.typeExtras.assetId;

    const giftBalance = await getFreeBalanceStatemine(address, chainId, assetId);
    if (giftBalance.isZero()) return BN_ZERO;

    const fee = await getAssetHubFee(chainId, asset, giftBalance);
    const rawBalance = giftBalance.sub(fee);

    return rawBalance.isNeg() ? BN_ZERO : rawBalance;
  };

  return { getAssetHubFee, getGiftBalanceStatemine };
};
