import noop from 'lodash/noop';

import { type ApiPromise } from '@polkadot/api';
import { type UnsubscribePromise } from '@polkadot/api/types';
import { BN, BN_ZERO } from '@polkadot/util';

import { getAssetId, toAddress } from '@/common/utils';
import { type Asset, type AssetType, type Chain } from '@/types/substrate';
import { type AccountBalance } from '@/types/substrate/balance';

export const balancesApi = {
  subscribeBalances,
};

function subscribeNativeBalanceChange(
  api: ApiPromise,
  chain: Chain,
  asset: Asset | undefined,
  accountId: AccountId,
  callback: (newBalances: AccountBalance[]) => void,
): UnsubscribePromise {
  if (!asset) return Promise.resolve(noop);

  const address = toAddress(accountId, { prefix: chain.addressPrefix });

  return api.query.system.account(address, (data: any[]) => {
    const newBalances: AccountBalance[] = [];

    for (const accountInfo of data) {
      const free = accountInfo.data.free.toBn();
      const reserved = accountInfo.data.reserved.toBn();
      let frozen: BN;

      if (accountInfo.data.miscFrozen || accountInfo.data.feeFrozen) {
        const miscFrozen = new BN(accountInfo.data.miscFrozen);
        const feeFrozen = new BN(accountInfo.data.feeFrozen);
        frozen = miscFrozen.gt(feeFrozen) ? miscFrozen : feeFrozen;
      } else {
        frozen = new BN(accountInfo.data.frozen);
      }

      newBalances.push({
        accountId,
        chainId: chain.chainId,
        assetId: asset.assetId.toString(),
        balance: {
          free,
          frozen,
          reserved,

          total: free.add(reserved),
          transferable: free.gt(frozen) ? free.sub(frozen) : BN_ZERO,
        },
      });
    }

    callback(newBalances);
  });
}

function subscribeStatemineAssetsChange(
  api: ApiPromise,
  chain: Chain,
  assets: Asset[],
  accountId: AccountId,
  callback: (newBalances: AccountBalance[]) => void,
): UnsubscribePromise {
  if (!assets.length || !api.query.assets) return Promise.resolve(noop);

  const assetsTuples = assets.map(asset => {
    return [getAssetId(asset), toAddress(accountId, { prefix: chain.addressPrefix })];
  });

  return api.query.assets.account.multi(assetsTuples, (data: any[]) => {
    const newBalances: AccountBalance[] = [];

    for (const [index, accountInfo] of data.entries()) {
      const free = accountInfo[0].isNone ? '0' : data[0].unwrap().balance.toString();

      newBalances.push({
        accountId,
        chainId: chain.chainId,
        assetId: assets[index].assetId.toString(),
        balance: {
          free,
          frozen: BN_ZERO,
          reserved: BN_ZERO,

          total: free,
          transferable: free,
        },
      });
    }

    callback(newBalances);
  });
}

function subscribeBalances(
  api: ApiPromise,
  chain: Chain,
  assets: Asset[],
  accountId: AccountId,
  callback: (newBalances: AccountBalance[]) => void,
): UnsubscribePromise[] {
  let nativeAsset: Asset | undefined;
  const statemineAssets: Asset[] = [];

  const actions: Record<AssetType, (asset: Asset) => void> = {
    native: (asset: Asset) => (nativeAsset = asset),
    statemine: (asset: Asset) => statemineAssets.push(asset),
  };

  assets.forEach(asset => actions[asset.type](asset));

  return [
    subscribeNativeBalanceChange(api, chain, nativeAsset, accountId, callback),
    subscribeStatemineAssetsChange(api, chain, statemineAssets, accountId, callback),
  ];
}
