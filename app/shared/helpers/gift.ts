import { type KeyringPair } from '@polkadot/keyring/types';
import { encodeAddress } from '@polkadot/util-crypto';

import { type ChainAsset, type PersistentGift } from '../../common/types';
import { getKeyringPairFromSeed, getStoreName } from '../../common/wallet';

import { type Chain } from '@/types/substrate';

import { GIFT_STORE } from './constants.ts';

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
  if (!gifts) return null;

  const map = new Map();
  gifts.forEach((gift: PersistentGift) => {
    map.set(gift.chainId, [...(map.get(gift.chainId) || []), gift]);
  });

  return map;
};

export const getGiftInfo = (
  chains: Chain[],
  publicKey: PublicKey,
  startParam: string,
): { chainAddress: string; chain: ChainAsset; giftAddress: string; symbol: string; keyring: KeyringPair } => {
  const [seed, symbol] = startParam.split('_');

  const chain = getAssetBySymbol(chains, symbol);
  const chainAddress = encodeAddress(publicKey, chain!.chain.addressPrefix);
  const keyring = getKeyringPairFromSeed(seed);
  const giftAddress = encodeAddress(keyring.publicKey, chain!.chain.addressPrefix);

  return { chainAddress, chain: chain!, giftAddress, symbol, keyring };
};

function getAssetBySymbol(chains: Chain[], symbol: string): ChainAsset | undefined {
  for (const chain of chains) {
    for (const asset of chain.assets) {
      if (asset.symbol == symbol) {
        return { chain, asset };
      }
    }
  }

  return undefined;
}
