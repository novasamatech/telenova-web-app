import { ChainId } from '@common/types';

export type GetExistentialDeposit = (chainId: ChainId) => Promise<string>;
export type GetExistentialDepositStatemine = (chainId: ChainId, assetId: string) => Promise<string>;
