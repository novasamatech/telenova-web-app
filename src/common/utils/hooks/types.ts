import { ChainId } from '@/common/types';

export type GetAssetHubFeeParam = {
  chainId: ChainId;
  assetId: string;
  transferAmmount: string;
  address?: string;
};

export type GetTransferFee = (
  params: GetAssetHubFeeParam,
) => Promise<{ transferDotFee: number; dotED: number; totalDotFee: number }>;

export type GetAssetHubGiftFee = (params: GetAssetHubFeeParam) => Promise<{ totalDotFee: number }>;

export type GetAssetHubFee = (params: GetAssetHubFeeParam & { isGift?: boolean }) => Promise<number>;
