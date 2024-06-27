import { type ChainId } from '@/common/types';

export type GetAssetHubFeeParam = {
  chainId: ChainId;
  assetId: string;
  transferAmount: string;
  address?: string;
};

export type GetTransferFee = (params: GetAssetHubFeeParam) => Promise<{
  transferDotFee: number;
  dotED: number;
  totalDotFee: number;
}>;
