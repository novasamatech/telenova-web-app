import secureLocalStorage from 'react-secure-storage';
import { ChainId, Gift } from '../types';

export const backupGifts = (address: string, secret: string, chainId: ChainId, balance: string): void => {
  const gift = { timestamp: Date.now(), address, secret, chainId, balance };

  secureLocalStorage.setItem(
    'GIFT_STORE',
    secureLocalStorage.getItem('GIFT_STORE')
      ? JSON.stringify([...JSON.parse(secureLocalStorage.getItem('GIFT_STORE') as string), gift])
      : JSON.stringify([gift]),
  );
};

export const getGifts = (): Map<ChainId, Gift[]> | null => {
  const gifts = JSON.parse(secureLocalStorage.getItem('GIFT_STORE') as string);
  if (!gifts) return null;

  const map = new Map();
  gifts.forEach((gift: Gift) => {
    map.set(gift.chainId, [...(map.get(gift.chainId) || []), gift]);
  });

  return map;
};
