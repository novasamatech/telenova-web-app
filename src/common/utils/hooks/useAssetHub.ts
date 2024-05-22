import { Asset } from '@/common/chainRegistry/types';
import { useBalances } from '../../balances/BalanceProvider';
import { useExtrinsicProvider } from '../../extrinsicService/ExtrinsicProvider';
import { ChainId } from '../../types';
import { formatBalance } from '../balance';
import { handleFeeStatemine } from '../extrinsics';
import { GetAssetHubFee } from './types';

const DOT_ED_AH = 100000000; // 0.01 DOT ED
const DOT_ASSET_ID = '0';

export const useAssetHub = () => {
  const { estimateFee, assetConversion } = useExtrinsicProvider();
  const { getFreeBalanceStatemine } = useBalances();

  const getAssetHubFee: GetAssetHubFee = async (chainId, assetId, address, transferAmmount, isGift) => {
    const fee = await handleFeeStatemine(estimateFee, chainId as ChainId, assetId, transferAmmount);

    // TODO: Delete it after PR for asset hub is merged
    const dotAHBalance = await getFreeBalanceStatemine(address, chainId, DOT_ASSET_ID);

    const dotFee = +dotAHBalance < DOT_ED_AH ? fee + DOT_ED_AH : fee;
    // Add more fee if it's a gift
    const totalDotFee = isGift ? dotFee + fee + DOT_ED_AH : dotFee;
    const totalFee = await assetConversion(chainId, totalDotFee, assetId);

    return totalFee;
  };

  const getGiftBalanceStatemine = async (chainId: ChainId, asset: Asset, address: string) => {
    const assetId = asset.typeExtras!.assetId;

    const giftBalance = await getFreeBalanceStatemine(address, chainId, assetId);
    if (giftBalance === '0') return '0';

    const fee = await getAssetHubFee(chainId, assetId, address, giftBalance);

    const rawBalance = +giftBalance - fee;
    if (rawBalance <= 0) return '0';

    const formattedBalance = formatBalance(rawBalance.toString(), asset.precision).formattedValue;

    return formattedBalance;
  };

  return { getAssetHubFee, getGiftBalanceStatemine };
};
