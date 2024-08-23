import { useUnit } from 'effector-react';

import { BN, BN_ZERO, hexToU8a } from '@polkadot/util';

import { networkModel } from '@/models/network';
import { type OrmlAccountData } from '@/shared/api/balances/types';
import { assetUtils } from '@/shared/helpers';
import { type Asset, type OrmlAsset, type StatemineAsset } from '@/types/substrate';

export const useQueryService = () => {
  const connections = useUnit(networkModel.$connections);

  async function getExistentialDeposit(chainId: ChainId, asset: Asset): Promise<BN> {
    const DEPOSIT_BY_TYPE: Record<Asset['type'], () => Promise<BN> | BN> = {
      native: () => getExistentialDepositNative(chainId),
      statemine: () => getExistentialDepositStatemine(chainId, asset as StatemineAsset),
      orml: () => getExistentialDepositOrml(asset as OrmlAsset),
    };

    return DEPOSIT_BY_TYPE[asset.type]();
  }

  async function getExistentialDepositNative(chainId: ChainId): Promise<BN> {
    const api = connections[chainId].api;

    return api!.consts.balances.existentialDeposit.toBn();
  }

  async function getExistentialDepositStatemine(chainId: ChainId, asset: StatemineAsset): Promise<BN> {
    const api = connections[chainId].api;
    const assetId = assetUtils.getAssetId(asset);
    const balance = await api!.query.assets.asset(assetId);

    return balance.value.minBalance.toBn();
  }

  function getExistentialDepositOrml(asset: OrmlAsset): BN {
    // existentialDeposit includes asset precision
    return new BN(asset.typeExtras.existentialDeposit);
  }

  async function assetConversion(chainId: ChainId, amount: BN, assetId: string): Promise<BN> {
    const api = connections[chainId].api;

    const convertedFee = await api!.call.assetConversionApi.quotePriceTokensForExactTokens(
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

    return convertedFee.isNone ? BN_ZERO : convertedFee.unwrap().toBn();
  }

  async function getFreeBalance(address: Address, chainId: ChainId): Promise<BN> {
    const api = connections[chainId].api!;
    const balance = await api.query.system.account(address);

    return balance.data.free.toBn();
  }

  async function getFreeBalanceOrml(address: Address, chainId: ChainId, asset: OrmlAsset): Promise<BN> {
    const api = connections[chainId].api!;
    const method = api.query['tokens']?.['accounts'] as any;

    const ormlAssetId = assetUtils.getAssetId(asset);
    const currencyIdType = asset.typeExtras.currencyIdType;
    const assetId = api.createType(currencyIdType, hexToU8a(ormlAssetId));

    const balance = await method(address, assetId);

    return (balance as OrmlAccountData).free.toBn();
  }

  async function getFreeBalanceStatemine(address: Address, chainId: ChainId, assetId: string): Promise<BN> {
    const api = connections[chainId].api;
    const balance = await api!.query.assets.account(assetId, address);

    return balance.isNone ? BN_ZERO : balance.unwrap().balance.toBn();
  }

  return {
    getExistentialDeposit,
    assetConversion,
    getFreeBalance,
    getFreeBalanceOrml,
    getFreeBalanceStatemine,
  };
};
