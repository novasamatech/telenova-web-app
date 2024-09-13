import { type ApiPromise } from '@polkadot/api';

import type { Asset, OrmlAsset, StatemineAsset } from '@/types/substrate';

import { BalanceTransferService } from './native-transfer';
import { OrmlTransferService } from './orml-transfer';
import { StatemineTransferService } from './statemine-transfer';
import { type ITransfer } from './types';

export const transferFactory = {
  createService,
};

function createService(api: ApiPromise, asset: Asset): ITransfer {
  const SERVICES: Record<Asset['type'], (api: ApiPromise, asset: Asset) => ITransfer> = {
    native: api => new BalanceTransferService(api),
    statemine: (api, asset) => new StatemineTransferService(api, asset as StatemineAsset),
    orml: (api, asset) => new OrmlTransferService(api, asset as OrmlAsset),
  };

  return SERVICES[asset.type](api, asset);
}
