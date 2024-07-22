import { attach, createEffect, createEvent, createStore, sample, scopeBind } from 'effector';
import { isEmpty } from 'lodash-es';
import { readonly } from 'patronum';

import { type ApiPromise } from '@polkadot/api';

import { networkModel } from '../network/network-model';
import { walletModel } from '../wallet/wallet-model';

import { balancesApi } from '@/shared/api';
import { type AccountBalance, type Asset, type Chain } from '@/types/substrate';

import { type ActiveAssets, type Subscriptions } from './types';

const assetToUnsubSet = createEvent<{ chainId: ChainId; assetId: AssetId }>();
const assetToSubSet = createEvent<{ chainId: ChainId; assetId: AssetId }>();
const balanceUpdated = createEvent<AccountBalance>();

const $balances = createStore<Record<ChainId, Record<AssetId, AccountBalance>>>({});

const $subscriptions = createStore<Subscriptions>({});
const $activeAssets = createStore<ActiveAssets>({});

type UnsubAssetParams = {
  chainId: ChainId;
  assetId?: number;
  subscriptions: Subscriptions;
};
const unsubscribeChainAssetsFx = createEffect(
  ({ chainId, assetId, subscriptions }: UnsubAssetParams): Subscriptions => {
    const { [chainId]: chainSubscriptions, ...restChains } = subscriptions;
    if (!chainSubscriptions) return restChains;

    const newSubscriptions = restChains;

    for (const [subAssetId, unsubPromise] of Object.entries(chainSubscriptions)) {
      // Save unsub function if assetId is absent or is not the one we're looking for
      const isAssetToHold = assetId && assetId !== Number(subAssetId);

      if (isAssetToHold && newSubscriptions[chainId]) {
        newSubscriptions[chainId][Number(subAssetId)] = unsubPromise;
        continue;
      }
      if (isAssetToHold && !newSubscriptions[chainId]) {
        newSubscriptions[chainId] = { [subAssetId]: unsubPromise };
        continue;
      }

      // If this is our assetId or all assets must be unsubscribed
      unsubPromise
        .then(unsub => unsub())
        .catch(error => {
          console.log(`Error while unsubscribing from balances for asset - ${assetId}`, error);
        });
    }

    return newSubscriptions;
  },
);

type SubAssetsParams = {
  apis: Record<ChainId, ApiPromise>;
  chains: Chain[];
  assets: Asset[][];
  accountId: AccountId;
  subscriptions: Subscriptions;
};
const pureSubscribeChainsAssetsFx = createEffect(
  ({ apis, chains, assets, accountId, subscriptions }: SubAssetsParams): Subscriptions => {
    const boundUpdate = scopeBind(balanceUpdated, { safe: true });

    const newChainSubscriptions: Subscriptions = {};

    chains.forEach((chain, index) => {
      const api = apis[chain.chainId];
      const assetsSubscriptions = subscriptions[chain.chainId] || {};

      assets[index].forEach(asset => {
        assetsSubscriptions[asset.assetId] = balancesApi.subscribeBalance(api, chain, asset, accountId, boundUpdate);
      });

      newChainSubscriptions[chain.chainId] = assetsSubscriptions;
    });

    return { ...subscriptions, ...newChainSubscriptions };
  },
);

// Internally effects are placed in the end of queue, data is already provided
// In order to get the latest $subscriptions we use attach
// It injects $subscriptions right before effect is called
const subscribeChainsAssetsFx = attach({
  effect: pureSubscribeChainsAssetsFx,
  source: $subscriptions,
  mapParams: (data: Omit<SubAssetsParams, 'subscriptions'>, subscriptions) => {
    return { ...data, subscriptions };
  },
});

sample({
  clock: [unsubscribeChainAssetsFx.doneData, subscribeChainsAssetsFx.doneData],
  target: $subscriptions,
});

sample({
  clock: balanceUpdated,
  source: $balances,
  fn: (oldBalances, newBalance) => {
    const { [newBalance.chainId]: chainBalance, ...rest } = oldBalances;

    return {
      ...rest,
      [newBalance.chainId]: { ...chainBalance, [newBalance.assetId]: newBalance },
    };
  },
  target: $balances,
});

sample({
  clock: assetToUnsubSet,
  source: $activeAssets,
  fn: (activeAssets, { chainId, assetId }) => {
    const { [chainId]: activeChainAssets, ...restChains } = activeAssets;
    if (!activeChainAssets) return restChains;

    const { [assetId]: _, ...restAssets } = activeChainAssets;

    return { ...restChains, [chainId]: isEmpty(restAssets) ? undefined : restChains };
  },
  target: $activeAssets,
});

sample({
  clock: assetToUnsubSet,
  source: $subscriptions,
  fn: (subscriptions, { chainId, assetId }) => ({ chainId, assetId, subscriptions }),
  target: unsubscribeChainAssetsFx,
});

sample({
  clock: assetToSubSet,
  source: $activeAssets,
  fn: (activeAssets, { chainId, assetId }) => {
    const { [chainId]: activeChainAssets, ...restChains } = activeAssets;

    return { ...restChains, [chainId]: { ...activeChainAssets, [assetId]: true } };
  },
  target: $activeAssets,
});

sample({
  clock: assetToSubSet,
  source: {
    account: walletModel.$account,
    connections: networkModel.$connections,
    chains: networkModel.$chains,
  },
  filter: ({ account, connections, chains }, data) => {
    const isAccountExist = Boolean(account);
    const isConnected = connections[data.chainId]?.status === 'connected';
    const hasAsset = chains[data.chainId]?.assets.some(a => a.assetId === data.assetId);

    return isAccountExist && isConnected && hasAsset;
  },
  fn: ({ account, connections, chains }, data) => {
    const apis = { [data.chainId]: connections[data.chainId].api! };
    const activeChains = [chains[data.chainId]];
    const assets = [chains[data.chainId].assets.filter(a => a.assetId === data.assetId)];

    return { apis, chains: activeChains, assets, accountId: account! };
  },
  target: subscribeChainsAssetsFx,
});

// Asset added - subscribe one asset
sample({
  clock: networkModel.output.assetChanged,
  filter: ({ status }) => status === 'on',
  target: assetToSubSet,
});

// Asset removed - unsubscribe one asset
sample({
  clock: networkModel.output.assetChanged,
  filter: ({ status }) => status === 'off',
  target: assetToUnsubSet,
});

// Chain connected - subscribe all assets for that chain
sample({
  clock: networkModel.output.connectionChanged,
  source: {
    account: walletModel.$account,
    connections: networkModel.$connections,
    chains: networkModel.$chains,
    activeAssets: $activeAssets,
  },
  filter: ({ account }, { status }) => {
    const isAccountExist = Boolean(account);
    const isConnected = status === 'connected';

    return isAccountExist && isConnected;
  },
  fn: ({ connections, chains, activeAssets, account }, data) => {
    const apis = { [data.chainId]: connections[data.chainId].api! };
    const activeChains = [chains[data.chainId]];
    const assets = [chains[data.chainId].assets.filter(a => activeAssets[data.chainId]?.[a.assetId])];

    return { apis, chains: activeChains, assets, accountId: account! };
  },
  target: subscribeChainsAssetsFx,
});

// Chain disconnected / error - unsubscribe all assets for that chain
sample({
  clock: networkModel.output.connectionChanged,
  source: $subscriptions,
  filter: (subscriptions, { chainId, status }) => {
    const isDisabled = status === 'disconnected';
    const isError = status === 'error';

    return (isDisabled || isError) && Boolean(subscriptions[chainId]);
  },
  fn: (subscriptions, { chainId }) => ({ chainId, subscriptions }),
  target: unsubscribeChainAssetsFx,
});

// Wallet is active - subscribe all active assets for relevant active chains
sample({
  clock: walletModel.$account.updates,
  source: {
    connections: networkModel.$connections,
    chains: networkModel.$chains,
    activeAssets: $activeAssets,
  },
  filter: ({ connections, activeAssets }, account) => {
    const isAccountExist = Boolean(account);
    const isAnyToConnect = !isEmpty(activeAssets);
    const isSomeConnected = Object.values(connections).some(({ status }) => status === 'connected');

    return isAccountExist && isAnyToConnect && isSomeConnected;
  },
  fn: ({ connections, chains, activeAssets }, account) => {
    const apis: Record<ChainId, ApiPromise> = {};
    for (const [chainId, connection] of Object.entries(connections)) {
      if (!activeAssets[chainId as ChainId] || connection.status !== 'connected') continue;

      apis[chainId as ChainId] = connection.api!;
    }

    const activeChains = Object.values(chains).filter(chain => activeAssets[chain.chainId]);

    const assets = activeChains.map(chain =>
      chain.assets.filter(asset => activeAssets[chain.chainId]?.[asset.assetId]),
    );

    return { apis, chains: activeChains, assets, accountId: account! };
  },
  target: subscribeChainsAssetsFx,
});

export const balancesModel = {
  $balances: readonly($balances),

  input: {
    assetToSubSet,
    assetToUnsubSet,
  },

  /* Internal API (tests only) */
  _internal: {
    $subscriptions,
    $activeAssets,
    $balances,

    balanceUpdated,

    subscribeChainsAssetsFx,
    unsubscribeChainAssetsFx,
  },
};
