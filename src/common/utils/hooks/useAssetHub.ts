import { Asset } from '@/common/chainRegistry/types';
import { useExtrinsicProvider } from '../../extrinsicService/ExtrinsicProvider';
import { ChainId } from '../../types';
import { formatBalance } from '../balance';
import { handleFeeStatemine } from '../extrinsics';
import { GetAssetHubFee } from './types';
import { useQueryService } from '@/common/queryService/QueryService';

const DOT_ASSET_ID = '0';

export const useAssetHub = () => {
  const { estimateFee } = useExtrinsicProvider();
  const { assetConversion, getExistentialDeposit, getFreeBalanceStatemine } = useQueryService();

  const getAssetHubFee: GetAssetHubFee = async (chainId, assetId, transferAmmount, address, isGift) => {
    const fee = await handleFeeStatemine(estimateFee, chainId as ChainId, assetId, transferAmmount);
    // TODO: Delete it after PR for asset hub is merged
    const dotED = Number((await getExistentialDeposit(chainId)) || '0');

    const dotAHBalance = address ? await getFreeBalanceStatemine(address, chainId, DOT_ASSET_ID) : '0';

    const dotFee = +dotAHBalance < dotED ? fee + dotED : fee;
    // Add more fee if it's a gift
    const totalDotFee = isGift ? dotFee + fee + dotED : dotFee;
    const totalFee = await assetConversion(chainId, totalDotFee, assetId);

    return totalFee;
  };

  const getGiftBalanceStatemine = async (chainId: ChainId, asset: Asset, address: string) => {
    const assetId = asset.typeExtras!.assetId;

    const giftBalance = await getFreeBalanceStatemine(address, chainId, assetId);
    if (giftBalance === '0') return '0';

    const fee = await getAssetHubFee(chainId, assetId, giftBalance, address);

    const rawBalance = +giftBalance - fee;
    if (rawBalance <= 0) return '0';

    const formattedBalance = formatBalance(rawBalance.toString(), asset.precision).formattedValue;

    return formattedBalance;
  };

  return { getAssetHubFee, getGiftBalanceStatemine };
};
