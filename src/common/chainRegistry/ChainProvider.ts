import { polkadot, kusama, westend, assetHub } from './knownChains';
import { Asset, Chain, ChainAsset, IChainProviderService } from './types';
import { ChainId } from '@common/types';

export const useChains = (): IChainProviderService => {
  // TODO change to chain.json
  const chains = [polkadot, kusama, westend, assetHub];

  const getAllChains = (): Promise<Chain[]> => {
    return new Promise(function (resolve) {
      resolve(chains);
    });
  };

  const getAssetBySymbol = (symbol: string): Promise<ChainAsset> => {
    return new Promise(function (resolve) {
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
    const chain = chains.find((chain) => chain.chainId == chainId);
    const asset = chain?.assets.find((asset) => asset.assetId == +assetId);

    return asset;
  };

  const getChain = (chainId: ChainId): Promise<Chain | undefined> => {
    return new Promise(function (resolve) {
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
