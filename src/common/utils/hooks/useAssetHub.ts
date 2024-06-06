import { ChainId } from '@common/types';
import { Asset } from '@/common/chainRegistry/types';
import { useQueryService } from '@/common/queryService/QueryService';
import { useExtrinsic, TransactionType } from '@/common/extrinsicService';
import { ZERO_BALANCE } from '../constants';
import { formatBalance } from '../balance';
import { GetAssetHubGiftFee, GetTransferFee } from './types';

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
    const giftDotFee = totalDotFee + transferDotFee + dotED;

    return { totalDotFee: giftDotFee };
  };

  const getAssetHubFee = async (
    chainId: ChainId,
    assetId: string,
    transferAmmount: string,
    address?: string,
    isGift?: boolean,
  ) => {
    const { totalDotFee } = isGift
      ? await getGiftFee({ chainId, assetId, transferAmmount, address })
      : await getTransferFee({ chainId, assetId, transferAmmount, address });

    const totalConvertedFee = await assetConversion(chainId, totalDotFee, assetId);

    return totalConvertedFee;
  };

  const getGiftBalanceStatemine = async (chainId: ChainId, asset: Asset, address: string) => {
    const assetId = asset.typeExtras!.assetId;

    const giftBalance = await getFreeBalanceStatemine(address, chainId, assetId);
    if (giftBalance === ZERO_BALANCE) return ZERO_BALANCE;

    const fee = await getAssetHubFee(chainId, assetId, giftBalance, address);
    const rawBalance = +giftBalance - fee;
    if (rawBalance <= 0) return ZERO_BALANCE;

    const formattedBalance = formatBalance(rawBalance.toString(), asset.precision).formattedValue;

    return formattedBalance;
  };

  return { getAssetHubFee, getGiftBalanceStatemine };
};
