import { type PolkadotSigner } from 'polkadot-api';

import { type Wallet } from '@/models/wallet';
import { TelegramApi, keyringApi } from '@/shared/api';
import { toAddress } from '@/shared/helpers/address.ts';
import { type Asset, type Chain, type PersistentGift } from '@/types/substrate';

import { GIFT_STORE } from './constants';

type BackupParams = {
  chainId: ChainId;
  assetId: number;
  address: string;
  secret: string;
  balance: string;
  chainIndex: number;
};
export const backupGifts = (params: BackupParams) => {
  const gift = { ...params, timestamp: Date.now() };

  const storedGifts = localStorage.getItem(TelegramApi.getStoreName(GIFT_STORE));
  const backup = storedGifts ? [...JSON.parse(storedGifts), gift] : [gift];

  localStorage.setItem(TelegramApi.getStoreName(GIFT_STORE), JSON.stringify(backup));
};

export const getGifts = (): Map<ChainId, PersistentGift[]> | null => {
  const gifts = JSON.parse(localStorage.getItem(TelegramApi.getStoreName(GIFT_STORE)) as string);
  if (!gifts) return null;

  const map = new Map<ChainId, PersistentGift[]>();
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
  signer: PolkadotSigner;
};
export const getGiftInfo = (chains: Chain[], wallet: Wallet, startParam: string): GiftInfo | undefined => {
  const [seed, ...rest] = startParam.split('_');
  let symbol: string | undefined;
  let chain: Chain | undefined;
  let asset: Asset | undefined;

  // Old gifts (with chainIndex)
  if (rest.length === 1) {
    symbol = rest[0];
    const payload = getAssetBySymbol(chains, symbol);
    chain = payload?.chain;
    asset = payload?.asset;
  }

  // New gifts (include chainIndex)
  if (rest.length === 2) {
    symbol = rest[1];
    chain = chains.find(chain => chain.chainIndex.toString() === rest[0]);
    asset = chain?.assets.find(asset => asset.symbol === symbol);
  }

  if (!chain || !asset || !symbol) return undefined;

  const signer = keyringApi.getSignerFromSeed(seed, chain);

  return {
    signer,
    asset,
    symbol,
    address: wallet.toAddress(chain),
    giftAddress: toAddress(signer.publicKey, { chain }),
    chainId: chain.chainId,
  };
};

function getAssetBySymbol(chains: Chain[], symbol: string): { chain: Chain; asset: Asset } | undefined {
  for (const chain of chains) {
    for (const asset of chain.assets) {
      if (asset.symbol !== symbol) continue;

      return { chain, asset };
    }
  }

  return undefined;
}
