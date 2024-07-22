import noop from 'lodash/noop';

import { type ApiPromise } from '@polkadot/api';
import { type UnsubscribePromise } from '@polkadot/api/types';
import { BN, BN_ZERO } from '@polkadot/util';

import { getAssetId, toAddress } from '@/common/utils';
import { type Asset, type AssetType, type Chain } from '@/types/substrate';
import { type AccountBalance } from '@/types/substrate/balance';

export const balancesApi = {
  subscribeBalance,
};

type ISubscribeBalance = (
  api: ApiPromise,
  chain: Chain,
  asset: Asset | undefined,
  accountId: AccountId,
  callback: (newBalance: AccountBalance) => void,
) => UnsubscribePromise;

const subscribeNativeBalanceChange: ISubscribeBalance = (api, chain, asset, accountId, callback) => {
  if (!asset) return Promise.resolve(noop);

  const address = toAddress(accountId, { prefix: chain.addressPrefix });

  return api.query.system.account(address, (accountInfo: any) => {
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

    callback({
      accountId,
      chainId: chain.chainId,
      assetId: asset.assetId,
      balance: {
        free,
        frozen,
        reserved,

        total: free.add(reserved),
        transferable: free.gt(frozen) ? free.sub(frozen) : BN_ZERO,
      },
    });
  });
};

const subscribeStatemineAssetsChange: ISubscribeBalance = (api, chain, asset, accountId, callback) => {
  if (!asset || !api.query.assets) return Promise.resolve(noop);

  const address = toAddress(accountId, { prefix: chain.addressPrefix });

  return api.query.assets.account(getAssetId(asset), address, (accountInfo: any[]) => {
    const free = accountInfo[0].isNone ? '0' : accountInfo[0].unwrap().balance.toString();

    callback({
      accountId,
      chainId: chain.chainId,
      assetId: asset.assetId,
      balance: {
        free,
        frozen: BN_ZERO,
        reserved: BN_ZERO,

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
  callback: (newBalance: AccountBalance) => void,
): UnsubscribePromise {
  const actions: Record<AssetType, ISubscribeBalance> = {
    native: subscribeNativeBalanceChange,
    statemine: subscribeStatemineAssetsChange,
  };

  return actions[asset.type](api, chain, asset, accountId, callback);
}
