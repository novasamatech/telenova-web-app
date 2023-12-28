import { polkadot, kusama, westend } from './knownChains';
import { Chain, ChainAsset, IChainProviderService } from './types';
import { ChainId } from '@common/types';

export const useChains = (): IChainProviderService => {
  const chains = [polkadot, kusama, westend];

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
    getChain,
  };
};
