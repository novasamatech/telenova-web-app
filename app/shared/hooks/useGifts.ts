import { useUnit } from 'effector-react';

import { BN, BN_ZERO } from '@polkadot/util';

import { type Gift, GiftStatus, type PersistentGift } from '@/common/types';
import { networkModel } from '@/models';
import { assetUtils } from '@/shared/helpers/assets.ts';

import { useAssetHub } from './useAssetHub.ts';

export const useGifts = () => {
  const { getAssetHubFee } = useAssetHub();

  const chains = useUnit(networkModel.$chains);
  const connections = useUnit(networkModel.$connections);

  const getGiftsState = async (mapGifts: Map<ChainId, PersistentGift[]>): Promise<[Gift[], Gift[]]> => {
    const unclaimed = [] as Gift[];
    const claimed = [] as Gift[];

    const requests = Array.from(mapGifts).map(async ([chainId, accounts]) => {
      if (connections[chainId]?.status !== 'connected') return;

      const api = connections[chainId].api!;
      const chain = chains[chainId];
      // To have a backward compatibility with old gifts
      const asset = accounts[0].assetId ? chain.assets.find(a => a.assetId === +accounts[0].assetId) : chain?.assets[0];

      if (assetUtils.isStatemineAsset(asset)) {
        const balances = await api.query.assets.account.multi(
          accounts.map(i => [asset?.typeExtras?.assetId, i.address]),
        );

        const maxBalance = balances.reduce((acc, balance) => {
          return balance.isNone ? acc : BN.max(acc, balance.unwrap().balance);
        }, BN_ZERO);
        const fee = await getAssetHubFee(chainId, asset, maxBalance);

        balances.forEach((balance, index) => {
          if (balance.isNone || balance.unwrap().balance.lte(fee)) {
            claimed.push({
              ...accounts[index],
              chainAsset: asset,
              status: GiftStatus.CLAIMED,
            });
          } else {
            unclaimed.push({ ...accounts[index], chainAsset: asset, status: GiftStatus.UNCLAIMED });
          }
        });
      } else {
        const balances = await api.query.system.account.multi(accounts.map(i => i.address));

        balances.forEach((balance, index) => {
          if (balance.data.free.isEmpty) {
            claimed.push({
              ...accounts[index],
              chainAsset: asset,
              status: GiftStatus.CLAIMED,
            });
          } else {
            unclaimed.push({ ...accounts[index], chainAsset: asset, status: GiftStatus.UNCLAIMED });
          }
        });
      }
    });

    await Promise.all(requests);

    return [unclaimed.sort((a, b) => b.timestamp - a.timestamp), claimed.sort((a, b) => b.timestamp - a.timestamp)];
  };

  return { getGiftsState };
};
