import noop from 'lodash/noop';

import { type ApiPromise } from '@polkadot/api';
import { type UnsubscribePromise } from '@polkadot/api/types';
import { BN_ZERO } from '@polkadot/util';

import { getAssetId, toAddress } from '@/common/utils';
import { type Asset, type Chain } from '@/types/substrate';
import { type AssetBalance } from '@/types/substrate/balance';

export const balancesApi = {
  subscribeBalance,
};

type ISubscribeBalance = (
  api: ApiPromise,
  chain: Chain,
  asset: Asset | undefined,
  accountId: AccountId,
  callback: (newBalance: AssetBalance) => void,
) => UnsubscribePromise;

const subscribeNativeBalanceChange: ISubscribeBalance = (api, chain, asset, accountId, callback) => {
  if (!asset) return Promise.resolve(noop);

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

const subscribeStatemineAssetsChange: ISubscribeBalance = (api, chain, asset, accountId, callback) => {
  if (!asset || !api.query.assets) return Promise.resolve(noop);

  const address = toAddress(accountId, { prefix: chain.addressPrefix });

  return api.query.assets.account(getAssetId(asset), address, accountInfo => {
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

function subscribeBalance(
  api: ApiPromise,
  chain: Chain,
  asset: Asset,
  accountId: AccountId,
  callback: (newBalance: AssetBalance) => void,
): UnsubscribePromise {
  const actions: Record<Asset['type'], ISubscribeBalance> = {
    native: subscribeNativeBalanceChange,
    statemine: subscribeStatemineAssetsChange,
  };

  return actions[asset.type](api, chain, asset, accountId, callback);
}
