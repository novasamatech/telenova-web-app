import { polkadot, kusama, westend } from './knownChains';
import { Chain, ChainAsset, IChainProviderService } from './types';

export const useChains = (): IChainProviderService => {
	const chains = [polkadot, kusama, westend];

	const getAllChains = (): Promise<Chain[]> => {
		return new Promise(function(resolve, reject) {
    		resolve(chains);
		});
	};

  	const getAssetBySymbol = (symbol: string): Promise<ChainAsset | undefined> => {
  		return new Promise(function(resolve, reject) {
  			for (const chain of chains) {
  				for (const asset of chain.assets) {
  					if (asset.symbol == symbol) {
  						resolve({ chain, asset });
  						return;
  					}
  				}
  			}
    		
    		resolve(undefined);
		});
  	}

  	return {
  		getAllChains,
  		getAssetBySymbol
  	};
};