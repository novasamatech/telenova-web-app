import { type BN, BN_ZERO } from '@polkadot/util';

import { assetUtils } from '../helpers';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useQueryService } from '@/common/queryService/QueryService';
import { type OrmlAsset } from '@/types/substrate';

type OrmlFeeParam = {
  chainId: ChainId;
  assetId: string;
  transferAmount: BN;
};

type AssetHubGiftFeeParam = OrmlFeeParam & {
  isGift?: boolean;
};

export const useOrml = () => {
  const { getTransactionFee } = useExtrinsic();
  const { getFreeBalanceOrml } = useQueryService();

  const getTransferFee = ({ chainId, assetId, transferAmount }: OrmlFeeParam): Promise<BN> => {
    return getTransactionFee(chainId, TransactionType.TRANSFER_ORML, transferAmount, assetId);
  };

  const getGiftFee = async ({ chainId, assetId, transferAmount }: AssetHubGiftFeeParam): Promise<BN> => {
    const transferDotFee = await getTransferFee({ chainId, assetId, transferAmount });

    return transferDotFee.muln(2);
  };

  const getOrmlFee = (chainId: ChainId, asset: OrmlAsset, transferAmount: BN, isGift = false): Promise<BN> => {
    const assetId = assetUtils.getAssetId(asset);

    return isGift
      ? getGiftFee({ chainId, assetId, transferAmount })
      : getTransferFee({ chainId, assetId, transferAmount });
  };

  const getOrmlGiftBalance = async (chainId: ChainId, giftAddress: string, asset: OrmlAsset): Promise<BN> => {
    const giftBalance = await getFreeBalanceOrml(giftAddress, chainId, asset);
    if (giftBalance.isZero()) return BN_ZERO;

    const fee = await getTransactionFee(chainId, TransactionType.TRANSFER_ORML, giftBalance);
    const rawBalance = giftBalance.sub(fee);

    return rawBalance.isNeg() ? BN_ZERO : rawBalance;
  };

  return { getOrmlFee, getOrmlGiftBalance };
};
