import { type KeyringPair } from '@polkadot/keyring/types';
import { encodeAddress } from '@polkadot/util-crypto';

import { type ChainAsset } from '../chainRegistry/types';
import { type ChainId, type PersistentGift, type PublicKey } from '../types';
import { getKeyringPairFromSeed, getStoreName } from '../wallet';

import { GIFT_STORE } from './constants';

type BackupParams = {
  address: string;
  secret: string;
  balance: string;
  chainId: ChainId;
  assetId: number;
};
export const backupGifts = ({ chainId, assetId, address, secret, balance }: BackupParams) => {
  const gift = {
    address,
    secret,
    chainId,
    assetId,
    balance,
    timestamp: Date.now(),
  };
  const storedGifts = localStorage.getItem(getStoreName(GIFT_STORE)) as string;
  const backup = storedGifts ? [...JSON.parse(storedGifts), gift] : [gift];

  localStorage.setItem(getStoreName(GIFT_STORE), JSON.stringify(backup));
};

export const getGifts = (): Map<ChainId, PersistentGift[]> | null => {
  const gifts = JSON.parse(localStorage.getItem(getStoreName(GIFT_STORE)) as string);
  if (!gifts) {
    return null;
  }

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
): Promise<{ chainAddress: string; chain: ChainAsset; giftAddress: string; symbol: string; keyring: KeyringPair }> => {
  const [seed, symbol] = (startParam as string).split('_');

  const chain = await getAssetBySymbol(symbol);
  const chainAddress = encodeAddress(publicKey as string, chain.chain.addressPrefix);
  const keyring = getKeyringPairFromSeed(seed);
  const giftAddress = encodeAddress(keyring.publicKey, chain.chain.addressPrefix);

  return { chainAddress, chain, giftAddress, symbol, keyring };
};