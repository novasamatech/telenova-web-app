import { type PolkadotClient } from 'polkadot-api';

import { type Asset, type NativeAsset, type StatemineAsset } from '@/types/substrate';

import { NativeBalanceService } from './native-balance';
import { StatemineBalanceService } from './statemine-balance';
import { type IBalance } from './types';

export const balancesFactory = {
  createService,
};

function createService(chainId: ChainId, client: PolkadotClient, asset: Asset): IBalance {
  const SERVICES: Record<Asset['type'], (chainId: ChainId, client: PolkadotClient, asset: Asset) => IBalance> = {
    native: (chainId, client, asset) => new NativeBalanceService(chainId, client, asset as NativeAsset),
    statemine: (chainId, client, asset) => new StatemineBalanceService(chainId, client, asset as StatemineAsset),
    // orml: (chainId, client, asset) => new OrmlBalanceService(chainId, client, asset as OrmlAsset),
  };

  return SERVICES[asset.type](chainId, client, asset);
}
