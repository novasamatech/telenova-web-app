import { attach, createEffect, createEvent, createStore, sample, scopeBind } from 'effector';
import { isEmpty } from 'lodash-es';
import { readonly } from 'patronum';

import { type ApiPromise } from '@polkadot/api';

import { networkModel } from '../network';
import { type Wallet, walletModel } from '../wallet';

import { balancesFactory } from '@/shared/api';
import { type Asset, type AssetBalance, type Chain, type ChainBalances } from '@/types/substrate';

import { type Subscriptions } from './types';

const assetToUnsubSet = createEvent<{ chainId: ChainId; assetId: AssetId }>();
const assetToSubSet = createEvent<{ chainId: ChainId; assetId: AssetId }>();
const balanceUpdated = createEvent<AssetBalance>();

const $balances = createStore<ChainBalances>({});

const $subscriptions = createStore<Subscriptions>({});

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
  wallet: Wallet;
  subscriptions: Subscriptions;
};
const pureSubscribeChainsAssetsFx = createEffect(
  ({ apis, chains, assets, wallet, subscriptions }: SubAssetsParams): Subscriptions => {
    const boundUpdate = scopeBind(balanceUpdated, { safe: true });

    const newChainSubscriptions: Subscriptions = {};

    chains.forEach((chain, index) => {
      const api = apis[chain.chainId];
      const assetsSubscriptions = subscriptions[chain.chainId] || {};

      assets[index].forEach(asset => {
        const service = balancesFactory.createService(api, asset);
        assetsSubscriptions[asset.assetId] = service.subscribeBalance(chain, wallet.toAddress(chain), boundUpdate);
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
  source: $subscriptions,
  fn: (subscriptions, { chainId, assetId }) => ({ chainId, assetId, subscriptions }),
  target: unsubscribeChainAssetsFx,
});

sample({
  clock: assetToSubSet,
  source: {
    wallet: walletModel.$wallet,
    connections: networkModel.$connections,
    chains: networkModel.$chains,
  },
  filter: ({ wallet, connections, chains }, data) => {
    const isWalletExist = Boolean(wallet);
    const isConnected = connections[data.chainId]?.status === 'connected';
    const hasAsset = chains[data.chainId]?.assets.some(a => a.assetId === data.assetId);

    return isWalletExist && isConnected && hasAsset;
  },
  fn: ({ wallet, connections, chains }, data) => {
    const apis = { [data.chainId]: connections[data.chainId].api! };
    const activeChains = [chains[data.chainId]];
    const assets = [chains[data.chainId].assets.filter(a => a.assetId === data.assetId)];

    return { apis, chains: activeChains, assets, wallet: wallet! };
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
    wallet: walletModel.$wallet,
    connections: networkModel.$connections,
    activeAssets: networkModel.$assets,
    chains: networkModel.$chains,
  },
  filter: ({ wallet }, { status }) => {
    const isWalletExist = Boolean(wallet);
    const isConnected = status === 'connected';

    return isWalletExist && isConnected;
  },
  fn: ({ connections, chains, activeAssets, wallet }, data) => {
    const apis = { [data.chainId]: connections[data.chainId].api! };
    const activeChains = [chains[data.chainId]];
    const assets = [chains[data.chainId].assets.filter(a => activeAssets[data.chainId]?.[a.assetId])];

    return { apis, chains: activeChains, assets, wallet: wallet! };
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
  clock: walletModel.$wallet.updates,
  source: {
    chains: networkModel.$chains,
    connections: networkModel.$connections,
    activeAssets: networkModel.$assets,
  },
  filter: ({ connections, activeAssets }, wallet) => {
    const isWalletExist = Boolean(wallet);
    const isAnyToConnect = !isEmpty(activeAssets);
    const isSomeConnected = Object.values(connections).some(({ status }) => status === 'connected');

    return isWalletExist && isAnyToConnect && isSomeConnected;
  },
  fn: ({ connections, chains, activeAssets }, wallet) => {
    const apis: Record<ChainId, ApiPromise> = {};
    for (const [chainId, connection] of Object.entries(connections)) {
      if (!activeAssets[chainId as ChainId] || connection.status !== 'connected') continue;

      apis[chainId as ChainId] = connection.api!;
    }

    const activeChains = Object.values(chains).filter(chain => activeAssets[chain.chainId]);

    const assets = activeChains.map(chain =>
      chain.assets.filter(asset => activeAssets[chain.chainId]?.[asset.assetId]),
    );

    return { apis, chains: activeChains, assets, wallet: wallet! };
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
    $balances,

    balanceUpdated,

    subscribeChainsAssetsFx,
    unsubscribeChainAssetsFx,
  },
};
