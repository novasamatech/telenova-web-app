import noop from 'lodash/noop';

import { type ApiPromise } from '@polkadot/api';
import { type UnsubscribePromise } from '@polkadot/api/types';
import { type AccountData } from '@polkadot/types/interfaces';
import { BN_ZERO, hexToU8a } from '@polkadot/util';

import { assetUtils, toAddress } from '@/shared/helpers';
import { type Asset, type Chain, type NativeAsset, type OrmlAsset, type StatemineAsset } from '@/types/substrate';
import { type AssetBalance } from '@/types/substrate/balance';

import { type ISubscribeBalance, type OrmlAccountData } from './types';

export const balancesApi = {
  subscribeBalance,
};

const subscribeNativeBalanceChange: ISubscribeBalance<NativeAsset> = (api, chain, asset, publicKey, callback) => {
  const address = toAddress(publicKey, { prefix: chain.addressPrefix });

  return api.query.system.account(address, frameAccountInfo => {
    let frozen = frameAccountInfo.data.frozen?.toBn();
    const free = frameAccountInfo.data.free.toBn();
    const reserved = frameAccountInfo.data.reserved.toBn();

    // Some chains still use "feeFrozen" or "miscFrozen" (HKO, PARA, XRT, ZTG, SUB)
    const accountData = frameAccountInfo.data as unknown as AccountData;
    if (accountData.feeFrozen || accountData.miscFrozen) {
      frozen = accountData.miscFrozen.gt(accountData.feeFrozen)
        ? accountData.miscFrozen.toBn()
        : accountData.feeFrozen.toBn();
    }

    callback({
      publicKey,
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

const subscribeStatemineAssetChange: ISubscribeBalance<StatemineAsset> = (api, chain, asset, publicKey, callback) => {
  if (!api.query.assets) return Promise.resolve(noop);

  const address = toAddress(publicKey, { prefix: chain.addressPrefix });

  return api.query.assets.account(assetUtils.getAssetId(asset), address, accountInfo => {
    const free = accountInfo.isNone ? BN_ZERO : accountInfo.unwrap().balance.toBn();

    callback({
      publicKey,
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

const subscribeOrmlAssetChange: ISubscribeBalance<OrmlAsset> = (api, chain, asset, publicKey, callback) => {
  const method = api.query['tokens']?.['accounts'] as any;

  if (!method) return Promise.resolve(noop);

  const ormlAssetId = assetUtils.getAssetId(asset);
  const currencyIdType = asset.typeExtras.currencyIdType;
  const assetId = api.createType(currencyIdType, hexToU8a(ormlAssetId));

  const address = toAddress(publicKey, { prefix: chain.addressPrefix });

  return method(address, assetId, (accountInfo: OrmlAccountData) => {
    const free = accountInfo.free.toBn();

    callback({
      publicKey,
      chainId: chain.chainId,
      assetId: asset.assetId,
      balance: {
        free,
        frozen: accountInfo.frozen.toBn(),
        reserved: accountInfo.reserved.toBn(),

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
  publicKey: PublicKey,
  callback: (newBalance: AssetBalance) => void,
): UnsubscribePromise {
  const actions: Record<Asset['type'], ISubscribeBalance<any>> = {
    native: subscribeNativeBalanceChange,
    statemine: subscribeStatemineAssetChange,
    orml: subscribeOrmlAssetChange,
  };

  return actions[asset.type](api, chain, asset, publicKey, callback);
}
