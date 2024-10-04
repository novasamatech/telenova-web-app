import { type ApiPromise } from '@polkadot/api';

import { type Asset, type NativeAsset, type OrmlAsset, type StatemineAsset } from '@/types/substrate';

import { NativeBalanceService } from './native-balance';
import { OrmlBalanceService } from './orml-balance';
import { StatemineBalanceService } from './statemine-balance';
import { type IBalance } from './types';

export const balancesFactory = {
  createService,
};

function createService(api: ApiPromise, asset: Asset): IBalance {
  const SERVICES: Record<Asset['type'], (api: ApiPromise, asset: Asset) => IBalance> = {
    native: (api, asset) => new NativeBalanceService(api, asset as NativeAsset),
    statemine: (api, asset) => new StatemineBalanceService(api, asset as StatemineAsset),
    orml: (api, asset) => new OrmlBalanceService(api, asset as OrmlAsset),
  };

  return SERVICES[asset.type](api, asset);
}
