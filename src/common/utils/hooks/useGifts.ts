import { ConnectionStatus, useChainRegistry } from '@common/chainRegistry';
import { ChainId, Gift, PersistentGift, GiftStatus } from '@common/types';
import { useAssetHub } from './useAssetHub';
import { isStatemineAsset } from '../assets';

export const useGifts = () => {
  const { getConnection, getChain, getAssetByChainId, connectionStates } = useChainRegistry();
  const { getAssetHubFee } = useAssetHub();

  async function getGiftsState(mapGifts: Map<ChainId, PersistentGift[]>): Promise<[Gift[], Gift[]]> {
    const unclaimed = [] as Gift[];
    const claimed = [] as Gift[];
    await Promise.all(
      Array.from(mapGifts).map(async ([chainId, accounts]) => {
        if (connectionStates[chainId].connectionStatus === ConnectionStatus.NONE) {
          return;
        }
        const connection = await getConnection(chainId);
        const chain = await getChain(chainId);
        // To have a backward compatibility with old gifts
        const asset = accounts[0].assetId ? getAssetByChainId(accounts[0].assetId, chainId) : chain?.assets[0];

        if (isStatemineAsset(asset?.type) && asset?.typeExtras?.assetId) {
          const balances = await connection.api.query.assets.account.multi(
            accounts.map((i) => [asset?.typeExtras?.assetId, i.address]),
          );

          const maxBalance = Math.max(
            ...balances.map((balance) => (balance.isNone ? 0 : Number(balance.unwrap().balance))),
          ).toString();
          const fee = await getAssetHubFee(chainId, asset.typeExtras.assetId, maxBalance);

          balances.forEach((balance, idx) => {
            balance.isNone || Number(balance.unwrap().balance) <= fee
              ? claimed.push({
                  ...accounts[idx],
                  chainAsset: asset,
                  status: GiftStatus.CLAIMED,
                })
              : unclaimed.push({ ...accounts[idx], chainAsset: asset, status: GiftStatus.UNCLAIMED });
          });
        } else {
          const balances = await connection.api.query.system.account.multi(accounts.map((i) => i.address));

          balances.forEach((d, idx) =>
            d.data.free.isEmpty
              ? claimed.push({
                  ...accounts[idx],
                  chainAsset: asset,
                  status: GiftStatus.CLAIMED,
                })
              : unclaimed.push({ ...accounts[idx], chainAsset: asset, status: GiftStatus.UNCLAIMED }),
          );
        }
      }),
    );

    return [unclaimed.sort((a, b) => b.timestamp - a.timestamp), claimed.sort((a, b) => b.timestamp - a.timestamp)];
  }

  return { getGiftsState };
};
