import noop from 'lodash/noop';

import { type ApiPromise } from '@polkadot/api';
import { type UnsubscribePromise } from '@polkadot/api/types';
import { BN_ZERO, hexToU8a } from '@polkadot/util';

import { assetUtils, toAddress } from '@/common/utils';
import { type Asset, type Chain, type NativeAsset, type OrmlAsset, type StatemineAsset } from '@/types/substrate';
import { type AssetBalance } from '@/types/substrate/balance';

export const balancesApi = {
  subscribeBalance,
};

type ISubscribeBalance<T extends Asset> = (
  api: ApiPromise,
  chain: Chain,
  asset: T,
  accountId: AccountId,
  callback: (newBalance: AssetBalance) => void,
) => UnsubscribePromise;

const subscribeNativeBalanceChange: ISubscribeBalance<NativeAsset> = (api, chain, asset, accountId, callback) => {
  const address = toAddress(accountId, { prefix: chain.addressPrefix });

  return api.query.system.account(address, accountInfo => {
    const free = accountInfo.data.free.toBn();
    const reserved = accountInfo.data.reserved.toBn();
    const frozen = accountInfo.data.frozen.toBn();

    callback({
      accountId,
      chainId: chain.chainId,
      assetId: asset.assetId,
      balance: {
        free,
        frozen,
        reserved,

        total: free.add(reserved).toString(),
        transferable: free.gt(frozen) ? free.sub(frozen).toString() : BN_ZERO.toString(),
      },
    });
  });
};

const subscribeStatemineAssetChange: ISubscribeBalance<StatemineAsset> = (api, chain, asset, accountId, callback) => {
  if (!api.query.assets) return Promise.resolve(noop);

  const address = toAddress(accountId, { prefix: chain.addressPrefix });

  return api.query.assets.account(assetUtils.getAssetId(asset), address, accountInfo => {
    const free = accountInfo.isNone ? BN_ZERO : accountInfo.unwrap().balance.toBn();

    callback({
      accountId,
      chainId: chain.chainId,
      assetId: asset.assetId,
      balance: {
        free,
        frozen: BN_ZERO,
        reserved: BN_ZERO,

        total: free.toString(),
        transferable: free.toString(),
      },
    });
  });
};

const subscribeOrmlAssetChange: ISubscribeBalance<OrmlAsset> = (api, chain, asset, accountId, callback) => {
  const method: (...args: any[]) => UnsubscribePromise =
    api.query['tokens']?.['accounts'] || api.query['currencies']?.['accounts'];

  if (!method) return Promise.resolve(noop);

  const ormlAssetId = assetUtils.getAssetId(asset);
  const currencyIdType = asset.typeExtras.currencyIdType;
  const assetId = api.createType(currencyIdType, hexToU8a(ormlAssetId));

  const address = toAddress(accountId, { prefix: chain.addressPrefix });

  return method(assetId, address, (accountInfo: any) => {
    const free = accountInfo.free.toBn();

    callback({
      accountId,
      chainId: chain.chainId,
      assetId: asset.assetId,
      balance: {
        free,
        frozen: accountInfo.frozen.toString(),
        reserved: accountInfo.reserved.toString(),

        total: free,
        transferable: free,
      },
    });
  });
};

function subscribeBalance(
  api: ApiPromise,
  chain: Chain,
  asset: Asset,
  accountId: AccountId,
  callback: (newBalance: AssetBalance) => void,
): UnsubscribePromise {
  const actions: Record<Asset['type'], ISubscribeBalance<any>> = {
    native: subscribeNativeBalanceChange,
    statemine: subscribeStatemineAssetChange,
    orml: subscribeOrmlAssetChange,
  };

  return actions[asset.type](api, chain, asset, accountId, callback);
}
