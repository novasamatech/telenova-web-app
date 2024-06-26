import { type ChainId } from '@/common/types';

export type AssetHubFeeParam = {
  chainId: ChainId;
  assetId: string;
  transferAmount: string;
};

export type AssetHubGiftFeeParam = AssetHubFeeParam & {
  isGift?: boolean;
};
