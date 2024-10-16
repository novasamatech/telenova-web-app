import { type PolkadotSigner } from 'polkadot-api';

import { keyringApi } from '@/shared/api';
import { toAddress } from '@/shared/helpers';
import { type Asset, type Chain } from '@/types/substrate';

type GiftInfo = {
  chainId: ChainId;
  asset: Asset;
  giftAddress: Address;
  symbol: string;
  signer: PolkadotSigner;
};
export const getGiftInfo = (chains: Chain[], startParam: string): GiftInfo | undefined => {
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
