import { type ChainId } from '@/common/types';

import { assetHub, kusama, polkadot, westend } from './knownChains';
import { type Asset, type Chain, type ChainAsset, type IChainProviderService } from './types';

// TODO: change to chain.json
const chains = [polkadot, kusama, westend, assetHub];

export const useChains = (): IChainProviderService => {
  const getAllChains = (): Promise<Chain[]> => Promise.resolve(chains);

  const getAssetBySymbol = (symbol: string): Promise<ChainAsset> => {
    return new Promise(resolve => {
      for (const chain of chains) {
        for (const asset of chain.assets) {
          if (asset.symbol == symbol) {
            resolve({ chain, asset });

            return;
          }
        }
      }
    });
  };

  const getAssetByChainId = (assetId: string, chainId: ChainId): Asset | undefined => {
    const chain = chains.find(chain => chain.chainId == chainId);

    return chain?.assets.find(asset => asset.assetId == +assetId);
  };

  const getChain = (chainId: ChainId): Promise<Chain | undefined> => {
    return new Promise(resolve => {
      for (const chain of chains) {
        if (chain.chainId == chainId) {
          resolve(chain);

          return;
        }
      }

      resolve(undefined);
    });
  };

  return {
    getAllChains,
    getAssetBySymbol,
    getAssetByChainId,
    getChain,
  };
};
