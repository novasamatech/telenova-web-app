import { useUnit } from 'effector-react';

import { BN, BN_ZERO, hexToU8a } from '@polkadot/util';

import { type Gift, GiftStatus, type PersistentGift } from '@/common/types';
import { networkModel } from '@/models';
import { assetUtils } from '@/shared/helpers/assets.ts';

import { useAssetHub } from './useAssetHub.ts';

export const useGifts = () => {
  const { getAssetHubFee } = useAssetHub();

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

        const maxBalance = balances.reduce((acc, balance) => {
          return balance.isNone ? acc : BN.max(acc, balance.unwrap().balance);
        }, BN_ZERO);
        const fee = await getAssetHubFee(chainId, asset, maxBalance);

        balances.forEach((balance, index) => {
          if (balance.isNone || balance.unwrap().balance.lte(fee)) {
            claimed.push({ ...gifts[index]!, chainAsset: asset, status: GiftStatus.CLAIMED });
          } else {
            unclaimed.push({ ...gifts[index]!, chainAsset: asset, status: GiftStatus.UNCLAIMED });
          }
        });
      } else if (assetUtils.isOrmlAsset(asset)) {
        const method = api.query['tokens']?.['accounts']?.multi as any;

        const ormlTuples = gifts.map(gift => {
          const ormlAssetId = assetUtils.getAssetId(asset);
          const currencyIdType = asset.typeExtras.currencyIdType;
          const assetId = api.createType(currencyIdType, hexToU8a(ormlAssetId));

          return [gift.address, assetId];
        });

        const balances = await method(ormlTuples);

        balances.forEach((balance: any, index: number) => {
          if (balance.data.free.isEmpty) {
            claimed.push({ ...gifts[index]!, chainAsset: asset, status: GiftStatus.CLAIMED });
          } else {
            unclaimed.push({ ...gifts[index]!, chainAsset: asset, status: GiftStatus.UNCLAIMED });
          }
        });
      } else {
        const balances = await api.query.system.account.multi(gifts.map(gift => gift.address));

        balances.forEach((balance, index) => {
          if (balance.data.free.isEmpty) {
            claimed.push({ ...gifts[index]!, chainAsset: asset, status: GiftStatus.CLAIMED });
          } else {
            unclaimed.push({ ...gifts[index]!, chainAsset: asset, status: GiftStatus.UNCLAIMED });
          }
        });
      }
    });

    await Promise.all(requests);

    return [unclaimed.sort((a, b) => b.timestamp - a.timestamp), claimed.sort((a, b) => b.timestamp - a.timestamp)];
  };

  return { getGiftsState };
};
