import { ChainId } from '@/common/types';

export type GetAssetHubFee = (
  chainId: ChainId,
  assetId: string,
  address: string,
  transferAmmount: string,
  isGift?: boolean,
) => Promise<number>;
