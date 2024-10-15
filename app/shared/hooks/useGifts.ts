// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useUnit } from 'effector-react';

import { networkModel } from '@/models/network';
import { assetUtils } from '@/shared/helpers/assets';
import { type Gift, type PersistentGift } from '@/types/substrate';

export const useGifts = () => {
  const chains = useUnit(networkModel.$chains);
  const connections = useUnit(networkModel.$connections);

  const getGiftsState = async (giftsMap: Map<ChainId, PersistentGift[]>): Promise<[Gift[], Gift[]]> => {
    const unclaimed: Gift[] = [];
    const claimed: Gift[] = [];

    const requests = Array.from(giftsMap).map(async ([chainId, gifts]) => {
      const chain = chains[chainId];
      if (!chain || connections[chainId]?.status !== 'connected') return;

      const api = connections[chainId].api!;
      // To have a backward compatibility with old gifts
      const asset = gifts[0]?.assetId
        ? chain.assets.find(a => a.assetId === Number(gifts[0]!.assetId))
        : chain.assets[0];

      if (assetUtils.isStatemineAsset(asset)) {
        const balances = await api.query.assets.account.multi(
          gifts.map(gift => [asset.typeExtras.assetId, gift.address]),
        );

        balances.forEach((balance, index) => {
          if (balance.isNone || balance.unwrap().balance.isEmpty) {
            claimed.push({ ...gifts[index]!, chainAsset: asset, status: 'Claimed' });
          } else {
            unclaimed.push({ ...gifts[index]!, chainAsset: asset, status: 'Unclaimed' });
          }
        });
      } else {
        const balances = await api.query.system.account.multi(gifts.map(gift => gift.address));

        balances.forEach((balance, index) => {
          if (balance.data.free.isEmpty) {
            claimed.push({ ...gifts[index]!, chainAsset: asset, status: 'Claimed' });
          } else {
            unclaimed.push({ ...gifts[index]!, chainAsset: asset, status: 'Unclaimed' });
          }
        });
      }
    });

    await Promise.all(requests);

    return [unclaimed.sort((a, b) => b.timestamp - a.timestamp), claimed.sort((a, b) => b.timestamp - a.timestamp)];
  };

  return { getGiftsState };
};
