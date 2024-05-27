import { Address, ChainId } from '@common/types';

import { useExtrinsicService } from '../extrinsicService/ExtrinsicService';
import { GetExistentialDeposit, GetExistentialDepositStatemine } from './types';

interface ExtrinsicService {
  getExistentialDeposit: GetExistentialDeposit;
  getExistentialDepositStatemine: GetExistentialDepositStatemine;
  assetConversion: (chainId: ChainId, amount: number, assetId: string) => Promise<number>;
  getFreeBalance: (address: Address, chainId: ChainId) => Promise<string>;
  getFreeBalanceStatemine: (address: Address, chainId: ChainId, assetId: string) => Promise<string>;
}

export function useQueryService(): ExtrinsicService {
  const { prepareApi } = useExtrinsicService();

  async function getExistentialDeposit(chainId: ChainId): Promise<string> {
    const api = await prepareApi(chainId);

    return api.consts.balances.existentialDeposit.toString();
  }

  async function getExistentialDepositStatemine(chainId: ChainId, assetId: string): Promise<string> {
    const api = await prepareApi(chainId);
    const balance = await api.query.assets.asset(assetId);

    return balance.value.minBalance.toString();
  }

  async function assetConversion(chainId: ChainId, amount: number, assetId: string): Promise<number> {
    const api = await prepareApi(chainId);

    const convertedFee = await api.call.assetConversionApi.quotePriceTokensForExactTokens(
      {
        // Token MultiLocation
        // @ts-expect-error type error
        parents: 0,
        interior: {
          // @ts-expect-error type error
          X2: [{ PalletInstance: 50 }, { GeneralIndex: assetId }],
        },
      },
      {
        // DOT MultiLocation
        parents: 1,
        interior: {
          Here: '',
        },
      },
      amount,
      true,
    );

    return Number(convertedFee);
  }

  async function getFreeBalance(address: Address, chainId: ChainId): Promise<string> {
    const api = await prepareApi(chainId);

    const balance = await api.query.system.account(address);

    return balance.data.free.toString();
  }

  async function getFreeBalanceStatemine(address: Address, chainId: ChainId, assetId: string): Promise<string> {
    const api = await prepareApi(chainId);
    const balance = await api.query.assets.account(assetId, address);

    return balance.isNone ? '0' : balance.unwrap().balance.toString();
  }

  return {
    getExistentialDeposit,
    getExistentialDepositStatemine,
    assetConversion,
    getFreeBalance,
    getFreeBalanceStatemine,
  };
}
