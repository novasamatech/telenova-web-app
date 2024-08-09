import { type WebApp } from '@twa-dev/types';

import { type KeyringPair } from '@polkadot/keyring/types';
import { encodeAddress } from '@polkadot/util-crypto';

import { type PersistentGift } from '../../common/types';
import { getKeyringPairFromSeed } from '../../common/wallet';

import { telegramApi } from '@/shared/api';
import { type Asset, type Chain } from '@/types/substrate';

import { GIFT_STORE } from './constants.ts';

type BackupParams = {
  chainId: ChainId;
  assetId: number;
  address: string;
  secret: string;
  balance: string;
};
export const backupGifts = (webApp: WebApp, params: BackupParams) => {
  const gift = { ...params, timestamp: Date.now() };

  const storedGifts = localStorage.getItem(telegramApi.getStoreName(webApp, GIFT_STORE));
  const backup = storedGifts ? [...JSON.parse(storedGifts), gift] : [gift];

  localStorage.setItem(telegramApi.getStoreName(webApp, GIFT_STORE), JSON.stringify(backup));
};

export const getGifts = (webApp: WebApp): Map<ChainId, PersistentGift[]> | null => {
  const gifts = JSON.parse(localStorage.getItem(telegramApi.getStoreName(webApp, GIFT_STORE)) as string);
  if (!gifts) return null;

  const map = new Map();
  gifts.forEach((gift: PersistentGift) => {
    map.set(gift.chainId, [...(map.get(gift.chainId) || []), gift]);
  });

  return map;
};

type GiftInfo = {
  chainId: ChainId;
  asset: Asset;
  address: Address;
  giftAddress: Address;
  symbol: string;
  keyring: KeyringPair;
};
export const getGiftInfo = (chains: Chain[], publicKey: PublicKey, startParam: string): GiftInfo | undefined => {
  // TODO: support old URLs
  const [seed, chainIndex, symbol] = startParam.split('_');

  const chain = chains.find(chain => chain.chainIndex.toString() === chainIndex);
  const asset = chain?.assets.find(asset => asset.symbol === symbol);
  if (!chain || !asset) return undefined;

  const keyring = getKeyringPairFromSeed(seed);
  const address = encodeAddress(publicKey, chain.addressPrefix);
  const giftAddress = encodeAddress(keyring.publicKey, chain.addressPrefix);

  return { chainId: chain.chainId, asset, address, giftAddress, symbol, keyring };
};

// function getAssetBySymbol(chains: Chain[], symbol: string): ChainAsset | undefined {
//   for (const chain of chains) {
//     for (const asset of chain.assets) {
//       if (asset.symbol == symbol) {
//         return { chain, asset };
//       }
//     }
//   }
//
//   return undefined;
// }
