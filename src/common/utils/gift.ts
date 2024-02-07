import secureLocalStorage from 'react-secure-storage';
import { encodeAddress } from '@polkadot/util-crypto';
import { KeyringPair } from '@polkadot/keyring/types';

import { getKeyringPairFromSeed, getStoreName } from '../wallet';
import { ChainId, PersistentGift, PublicKey } from '../types';
import { ChainAsset } from '../chainRegistry/types';
import { GIFT_STORE } from './constants';

export const backupGifts = (address: string, secret: string, chainId: ChainId, balance: string): void => {
  const gift = { timestamp: Date.now(), address, secret, chainId, balance };
  const storedGifts = secureLocalStorage.getItem(getStoreName(GIFT_STORE)) as string;
  const backup = storedGifts ? [...JSON.parse(storedGifts), gift] : [gift];

  secureLocalStorage.setItem(getStoreName(GIFT_STORE), JSON.stringify(backup));
};

export const getGifts = (): Map<ChainId, PersistentGift[]> | null => {
  const gifts = JSON.parse(secureLocalStorage.getItem(getStoreName(GIFT_STORE)) as string);
  if (!gifts) return null;

  const map = new Map();
  gifts.forEach((gift: PersistentGift) => {
    map.set(gift.chainId, [...(map.get(gift.chainId) || []), gift]);
  });

  return map;
};

export const getGiftInfo = async (
  publicKey: PublicKey,
  startParam: string,
  getAssetBySymbol: (symbol: string) => Promise<ChainAsset>,
): Promise<{ chainAddress: string; chain: ChainAsset; giftAddress: string; keyring: KeyringPair }> => {
  const [seed, symbol] = (startParam as string).split('_');
  const chain = await getAssetBySymbol(symbol);
  const chainAddress = encodeAddress(publicKey as string, chain.chain.addressPrefix);
  const keyring = getKeyringPairFromSeed(seed);
  const giftAddress = encodeAddress(keyring.publicKey, chain.chain.addressPrefix);

  return { chainAddress, chain, giftAddress, keyring };
};
