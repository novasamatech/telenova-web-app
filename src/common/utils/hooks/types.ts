import { ChainId } from '@/common/types';

export type GetAssetHubFee = (
  chainId: ChainId,
  assetId: string,
  transferAmmount: string,
  address?: string,
  isGift?: boolean,
) => Promise<number>;
