import secureLocalStorage from 'react-secure-storage';
import { ChainId, PersistentGift } from '../types';

export const backupGifts = (address: string, secret: string, chainId: ChainId, balance: string): void => {
  const gift = { timestamp: Date.now(), address, secret, chainId, balance };
  const storedGifts = secureLocalStorage.getItem('GIFT_STORE') as string;
  const backup = storedGifts ? [...JSON.parse(storedGifts), gift] : [gift];

  secureLocalStorage.setItem('GIFT_STORE', JSON.stringify(backup));
};

export const getGifts = (): Map<ChainId, PersistentGift[]> | null => {
  const gifts = JSON.parse(secureLocalStorage.getItem('GIFT_STORE') as string);
  if (!gifts) return null;

  const map = new Map();
  gifts.forEach((gift: PersistentGift) => {
    map.set(gift.chainId, [...(map.get(gift.chainId) || []), gift]);
  });

  return map;
};
